import flask
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os

# import firebase_admin
# from firebase_admin import credentials, db
from dotenv import load_dotenv
import stripe

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# cred = firebase_admin.credentials.Certificate("path/to/serviceAccountKey.json")

# firebase_admin.initialize_app(
#     cred, {"databaseURL": "https://your-database-name.firebaseio.com"}
# )

app = Flask(__name__)
CORS(app, supports_credentials=True)

if not os.path.exists("instance"):
    os.makedirs("instance")

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///RaiseUp.db"
app.config["SECRET_KEY"] = "your-secret-key-here"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SESSION_COOKIE_NAME"] = "your_session_cookie"
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_COOKIE_SECURE"] = True
db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = "user"
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), nullable=False, unique=True)
    date_created = db.Column(db.DateTime, default=datetime.now)
    password_hash = db.Column(db.String(128))
    is_staff = db.Column(db.Boolean, nullable=False, default=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.user_id} - {self.email}>"


class Campaign(db.Model):
    __tablename__ = "campaign"
    campaign_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    goal_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.now)

    user = db.relationship("User", backref="campaigns")

    def serialize(self):
        return {
            "campaign_id": self.campaign_id,
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description,
            "goal_amount": self.goal_amount,
            "current_amount": self.current_amount,
            "created_at": self.created_at.isoformat(),
        }


class Comment(db.Model):
    __tablename__ = "comment"
    comment_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    campaign_id = db.Column(
        db.Integer, db.ForeignKey("campaign.campaign_id"), nullable=False
    )
    content = db.Column(db.String(200), nullable=True)

    user = db.relationship("User", backref="comments")
    campaign = db.relationship("Campaign", backref="comments")


class Donation(db.Model):
    __tablename__ = "donation"
    donation_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    campaign_id = db.Column(
        db.Integer, db.ForeignKey("campaign.campaign_id"), nullable=False
    )
    comment_id = db.Column(
        db.Integer, db.ForeignKey("comment.comment_id"), nullable=True
    )
    amount = db.Column(db.Float, nullable=False)
    anonymous = db.Column(db.Boolean, nullable=False, default=False)
    date_created = db.Column(db.DateTime, default=datetime.now)

    user = db.relationship("User", backref="donations")
    campaign = db.relationship("Campaign", backref="donations")
    comment = db.relationship("Comment", backref="donations")


@app.route("/api/auth/register", methods=["POST"])
def register():
    try:
        data = request.get_json()

        required_fields = ["name", "email", "password"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"message": f"{field} is required"}), 400

        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"message": "Email already exists"}), 400

        new_user = User(name=data["name"], email=data["email"])
        new_user.set_password(data["password"])

        db.session.add(new_user)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "User created successfully",
                    "user": {
                        "id": new_user.user_id,
                        "name": new_user.name,
                        "email": new_user.email,
                    },
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500


@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(email=data["email"]).first()

        if user and user.check_password(data["password"]):
            session["user_id"] = user.user_id
            session["is_staff"] = user.is_staff
            return jsonify(
                {
                    "message": "Login successful",
                    "user": {
                        "id": user.user_id,
                        "name": user.name,
                        "email": user.email,
                    },
                }
            )
        else:
            return jsonify({"message": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"message": str(e)}), 500


@app.route("/debug/users", methods=["GET"])
def list_users():
    users = User.query.all()
    return jsonify(
        [
            {
                "id": user.user_id,
                "name": user.name,
                "email": user.email,
                "date_created": (
                    user.date_created.isoformat() if user.date_created else None
                ),
            }
            for user in users
        ]
    )

@app.route("/api/campaigns/search", methods=["GET"])
def search_campaigns():
    query = request.args.get("query")
    campaigns = Campaign.query.filter(Campaign.title.ilike(f"%{query}%")).all()
    return jsonify([campaign.serialize() for campaign in campaigns])

import logging

logging.basicConfig(level=logging.DEBUG)


@app.route("/api/payment", methods=["POST"])
def create_payment():
    try:
        data = request.get_json()

        amount = data.get("amount")
        if not amount or not amount.isdigit():
            raise ValueError("Invalid amount. Please provide a valid number.")

        amount_in_cents = int(float(amount) * 100)

        currency = data.get("currency", "usd")
        description = data.get("description", "RaiseUp Donation")
        customer_email = data.get("email")

        if not customer_email:
            raise ValueError("Email is required.")

        intent = stripe.PaymentIntent.create(
            amount=amount_in_cents,
            currency=currency,
            description=description,
            receipt_email=customer_email,
        )

        return jsonify({"client_secret": intent["client_secret"]}), 200

    except Exception as e:
        logging.error(f"Error processing payment: {e}")
        return jsonify({"message": str(e)}), 500

@app.route("/api/user/isStaff", methods=["GET"])
def is_staff():
    if "user_id" in session:
        return jsonify({"is_staff": session["is_staff"]})
    return jsonify({"is_staff": False})

@app.route("/api/campaign/get", methods=["GET"])
def get_campaign():
    # Query the campaign by ID
    id = request.args.get("campaign_id")
    print(id)
    campaign = Campaign.query.get(id)
    if not campaign:
        return jsonify({"error": "Campaign not found"}), 404
    campaign_data = {
        "id": campaign.campaign_id,
        "title": campaign.title,
        "description": campaign.description,
        "goal_amount": campaign.goal_amount,
        "current_amount": campaign.current_amount,
        "created_at": campaign.created_at.isoformat() if campaign.created_at else None,
    }
    return jsonify(campaign_data), 200

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
