from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
CORS(app)

if not os.path.exists("instance"):
    os.makedirs("instance")

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///RaiseUp.db"
app.config["SECRET_KEY"] = "your-secret-key-here"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = "user"
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), nullable=False, unique=True)
    date_created = db.Column(db.DateTime, default=datetime.now)
    password_hash = db.Column(db.String(128))

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
    amount = db.Column(db.Float, nullable=False)  # Added amount field
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


if __name__ == "__main__":
    with app.app_context():
        db.create_all()  
    app.run(debug=True)
