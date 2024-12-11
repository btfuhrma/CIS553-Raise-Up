import flask
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os
<<<<<<< Updated upstream

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
=======


import firebase_admin
from firebase_admin import credentials, db, firestore

# Path to the downloaded service account key file
# cred = firebase_admin.credentials.Certificate("raise-up-d4d5c-firebase-adminsdk-acf32-949f3720bb.json")

current_dir = os.path.dirname(os.path.abspath(__file__))
cred_path = os.path.join(current_dir, "raise-up-d4d5c-firebase-adminsdk-acf32-949f3720bb.json")
cred = firebase_admin.credentials.Certificate(cred_path)

# Initialize Firebase with the service account and database URL
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://console.firebase.google.com/project/raise-up-d4d5c/database/raise-up-d4d5c-default-rtdb/data/~2F'
})
>>>>>>> Stashed changes

app = Flask(__name__)
CORS(app, supports_credentials=True)

if not os.path.exists("instance"):
    os.makedirs("instance")

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///RaiseUp.db"
app.config["SECRET_KEY"] = "your-secret-key-here"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
<<<<<<< Updated upstream
app.config["SESSION_COOKIE_NAME"] = "your_session_cookie"
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_COOKIE_SECURE"] = True
db = SQLAlchemy(app)
=======
# db = SQLAlchemy(app)
db = firestore.client()
>>>>>>> Stashed changes

# Initialize Firebase (assuming you already have this)

<<<<<<< Updated upstream
class User(db.Model):
    __tablename__ = "user"
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), nullable=False, unique=True)
    date_created = db.Column(db.DateTime, default=datetime.now)
    password_hash = db.Column(db.String(128))
    is_staff = db.Column(db.Boolean, nullable=False, default=False)
=======
# Helper functions for data conversion
def user_to_dict(user_doc):
    user_data = user_doc.to_dict()
    user_data['id'] = user_doc.id
    return user_data
>>>>>>> Stashed changes

def campaign_to_dict(campaign_doc):
    campaign_data = campaign_doc.to_dict()
    campaign_data['id'] = campaign_doc.id
    return campaign_data

# User Management Functions
def create_user(name, email, password):
    # Check if email exists
    users_ref = db.collection('users').where('email', '==', email).limit(1)
    if len(list(users_ref.get())) > 0:
        raise ValueError("Email already exists")

    user_data = {
        'name': name,
        'email': email,
        'password_hash': generate_password_hash(password),
        'date_created': datetime.now()
    }
    return db.collection('users').add(user_data)

def get_user_by_email(email):
    users_ref = db.collection('users').where('email', '==', email).limit(1)
    users = list(users_ref.get())
    return users[0] if users else None

# Campaign Management Functions
def create_campaign(user_id, title, description, goal_amount):
    campaign_data = {
        'user_id': user_id,
        'title': title,
        'description': description,
        'goal_amount': float(goal_amount),
        'current_amount': 0.0,
        'created_at': datetime.now()
    }
    return db.collection('campaigns').add(campaign_data)

<<<<<<< Updated upstream
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
=======
# Comment Management Functions
def create_comment(user_id, campaign_id, content):
    comment_data = {
        'user_id': user_id,
        'campaign_id': campaign_id,
        'content': content,
        'created_at': datetime.now()
    }
    return db.collection('comments').add(comment_data)
>>>>>>> Stashed changes

# Donation Management Functions
def create_donation(user_id, campaign_id, amount, anonymous=False, comment_id=None):
    donation_data = {
        'user_id': user_id,
        'campaign_id': campaign_id,
        'amount': float(amount),
        'anonymous': anonymous,
        'comment_id': comment_id,
        'date_created': datetime.now()
    }
    
    # Add donation
    donation_ref = db.collection('donations').add(donation_data)
    
    # Update campaign amount
    campaign_ref = db.collection('campaigns').document(campaign_id)
    campaign_ref.update({
        'current_amount': firestore.Increment(float(amount))
    })
    
    return donation_ref

# Routes
@app.route("/api/auth/register", methods=["POST"])
def register():
    try:
        data = request.get_json()

        required_fields = ["name", "email", "password"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"message": f"{field} is required"}), 400

        user_ref, user_doc = create_user(data["name"], data["email"], data["password"])
        
        return jsonify({
            "message": "User created successfully",
            "user": {
                "id": user_ref.id,
                "name": data["name"],
                "email": data["email"]
            }
        }), 201

    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        user_doc = get_user_by_email(data["email"])

<<<<<<< Updated upstream
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
=======
        if user_doc and check_password_hash(user_doc.to_dict()['password_hash'], data["password"]):
            user_data = user_doc.to_dict()
            return jsonify({
                "message": "Login successful",
                "user": {
                    "id": user_doc.id,
                    "name": user_data["name"],
                    "email": user_data["email"]
>>>>>>> Stashed changes
                }
            })
        else:
            return jsonify({"message": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route("/debug/users", methods=["GET"])
def list_users():
<<<<<<< Updated upstream
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
    return jsonify([campaign.serialize() for campaign in campaigns]), 200

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
        return jsonify({"is_staff": session["is_staff"]}), 200
    return jsonify({"is_staff": False}), 500

@app.route("/api/campaign/get", methods=["GET"])
def get_campaign():
    # Query the campaign by ID
    id = request.args.get("campaign_id")
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

@app.route("/api/campaign/update", methods=["POST"])
def updateCampaign():
    data = request.get_json()
    id = data.get("campaign_id")
    title = data.get("title")
    desc = data.get("description")
    goal_amount = data.get("goal_amount")
    image = data.get("image")
    campaign = Campaign.query.filter_by(campaign_id=id).one_or_none()
    campaign.title = title
    campaign.description = desc
    campaign.goal_amount = goal_amount
    db.session.commit()
    return jsonify(True), 200

@app.route("/api/campaign/remove", methods=["DELETE"])
def removeCampaign():
    data = request.get_json()
    id = data.get("campaign_id")
    campaign = Campaign.query.filter_by(campaign_id=id).one_or_none()
    db.session.delete(campaign)
    db.session.commit()
    return jsonify(True), 200

@app.route("/api/comment/list", methods=["GET"])
def getComments():
    try:
        campaign_id = request.args.get("campaign_id")
        if not campaign_id:
            return jsonify({"error": "Campaign ID is required"}), 400

        comments = Comment.query.filter_by(campaign_id=campaign_id).all()

        comments_data = [
            {
                "content": comment.content,
                "username": comment.user.name if comment.user else "Unknown User",
                "comment_id": comment.comment_id
            }
            for comment in comments
        ]

        return jsonify(comments_data), 200

    except Exception as e:
        logging.error(f"Error fetching comments: {e}")
        return jsonify({"error": "An error occurred while fetching comments"}), 500
    
@app.route("/api/comment/get", methods=["GET"])
def getComment():
    # Query the campaign by ID
    id = request.args.get("comment_id")
    comment = Comment.query.get(id)
    if not comment:
        return jsonify({"error": "Comment not found"}), 404
    comment_data = {
        "comment_id": comment.comment_id,
        "content": comment.content if comment.user else "Unknown User",
        "username": comment.user.name,
    }
    return jsonify(comment_data), 200

@app.route("/api/comment/update", methods=["POST"])
def updateComment():
    data = request.get_json()
    id = data.get("comment_id")
    content = data.get("content")
    comment = Comment.query.filter_by(campaign_id=id).one_or_none()
    comment.title = content
    db.session.commit()
    return jsonify(True), 200

@app.route("/api/comment/remove", methods=["DELETE"])
def removeComment():
    data = request.get_json()
    id = data.get("comment_id")
    comment = Comment.query.filter_by(campaign_id=id).one_or_none()
    db.session.delete(comment)
    db.session.commit()
    return jsonify(True), 200


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
=======
    try:
        users_ref = db.collection('users').stream()
        users = []
        for user_doc in users_ref:
            user_data = user_doc.to_dict()
            users.append({
                "id": user_doc.id,
                "name": user_data["name"],
                "email": user_data["email"],
                "date_created": user_data["date_created"].isoformat() if "date_created" in user_data else None
            })
        return jsonify(users)
    except Exception as e:
        return jsonify({"message": str(e)}), 500

if __name__ == "__main__":
>>>>>>> Stashed changes
    app.run(debug=True)



# 
# class User(db.Model):
    # __tablename__ = "user"
    # user_id = db.Column(db.Integer, primary_key=True)
    # name = db.Column(db.String(50), nullable=False)
    # email = db.Column(db.String(50), nullable=False, unique=True)
    # date_created = db.Column(db.DateTime, default=datetime.now)
    # password_hash = db.Column(db.String(128))
# 
    # def set_password(self, password):
        # self.password_hash = generate_password_hash(password)
# 
    # def check_password(self, password):
        # return check_password_hash(self.password_hash, password)
# 
    # def __repr__(self):
        # return f"<User {self.user_id} - {self.email}>"
# 
# 
# class Campaign(db.Model):
    # __tablename__ = "campaign"
    # campaign_id = db.Column(db.Integer, primary_key=True)
    # user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    # title = db.Column(db.String(100), nullable=False)
    # description = db.Column(db.Text, nullable=True)
    # goal_amount = db.Column(db.Float, nullable=False)
    # current_amount = db.Column(db.Float, default=0.0)
    # created_at = db.Column(db.DateTime, default=datetime.now)
# 
    # user = db.relationship("User", backref="campaigns")
# 
# 
# class Comment(db.Model):
    # __tablename__ = "comment"
    # comment_id = db.Column(db.Integer, primary_key=True)
    # user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    # campaign_id = db.Column(
        # db.Integer, db.ForeignKey("campaign.campaign_id"), nullable=False
    # )
    # content = db.Column(db.String(200), nullable=True)
# 
    # user = db.relationship("User", backref="comments")
    # campaign = db.relationship("Campaign", backref="comments")
# 
# 
# class Donation(db.Model):
    # __tablename__ = "donation"
    # donation_id = db.Column(db.Integer, primary_key=True)
    # user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    # campaign_id = db.Column(
        # db.Integer, db.ForeignKey("campaign.campaign_id"), nullable=False
    # )
    # comment_id = db.Column(
        # db.Integer, db.ForeignKey("comment.comment_id"), nullable=True
    # )
    # amount = db.Column(db.Float, nullable=False)  # Added amount field
    # anonymous = db.Column(db.Boolean, nullable=False, default=False)
    # date_created = db.Column(db.DateTime, default=datetime.now)
# 
    # user = db.relationship("User", backref="donations")
    # campaign = db.relationship("Campaign", backref="donations")
    # comment = db.relationship("Comment", backref="donations")
# 
# 
# @app.route("/api/auth/register", methods=["POST"])
# def register():
    # try:
        # data = request.get_json()
# 
        # required_fields = ["name", "email", "password"]
        # for field in required_fields:
            # if not data.get(field):
                # return jsonify({"message": f"{field} is required"}), 400
# 
        # if User.query.filter_by(email=data["email"]).first():
            # return jsonify({"message": "Email already exists"}), 400
# 
        # new_user = User(name=data["name"], email=data["email"])
        # new_user.set_password(data["password"])
# 
        # db.session.add(new_user)
        # db.session.commit()
# 
        # return (
            # jsonify(
                # {
                    # "message": "User created successfully",
                    # "user": {
                        # "id": new_user.user_id,
                        # "name": new_user.name,
                        # "email": new_user.email,
                    # },
                # }
            # ),
            # 201,
        # )
# 
    # except Exception as e:
        # db.session.rollback()
        # return jsonify({"message": str(e)}), 500
# 
# 
# @app.route("/api/auth/login", methods=["POST"])
# def login():
    # try:
        # data = request.get_json()
        # user = User.query.filter_by(email=data["email"]).first()
# 
        # if user and user.check_password(data["password"]):
            # return jsonify(
                # {
                    # "message": "Login successful",
                    # "user": {
                        # "id": user.user_id,
                        # "name": user.name,
                        # "email": user.email,
                    # },
                # }
            # )
        # else:
            # return jsonify({"message": "Invalid credentials"}), 401
# 
    # except Exception as e:
        # return jsonify({"message": str(e)}), 500
# 
# 
# @app.route("/debug/users", methods=["GET"])
# def list_users():
    # users = User.query.all()
    # return jsonify(
        # [
            # {
                # "id": user.user_id,
                # "name": user.name,
                # "email": user.email,
                # "date_created": (
                    # user.date_created.isoformat() if user.date_created else None
                # ),
            # }
            # for user in users
        # ]
    # )
# 
# 
# if __name__ == "__main__":
    # with app.app_context():
        # db.create_all()  
    # app.run(debug=True)
# 