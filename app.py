from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///RaiseUp.db'
db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = 'user'
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), nullable=False, unique=True)
    date_created = db.Column(db.DateTime, default=datetime.now)

    def __repr__(self):
        return f"<User {self.user_id} - {self.email}>"
    

class Campaign(db.Model):
    __tablename__ = 'campaign'
    campaign_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    goal_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.now)
    
    user = db.relationship('User', backref='campaigns')

    def __repr__(self):
        return f"<Campaign {self.campaign_id} - {self.title}>"


class Comment(db.Model):
    __tablename__ = 'comment'
    comment_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign.campaign_id'), nullable=False)
    content = db.Column(db.String(200), nullable=True)

    user = db.relationship('User', backref='comments')
    campaign = db.relationship('Campaign', backref='comments')

    def __repr__(self):
        return f"<Comment {self.comment_id} by User {self.user_id} on Campaign {self.campaign_id}>"
    
class Donation(db.Model):
    __tablename__ = 'donation'
    donation_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign.campaign_id'), nullable=False)
    comment_id = db.Column(db.Integer, db.ForeignKey('comment.comment_id'), nullable=True)
    anonymous = db.Column(db.Boolean, nullable=False, default=False)


    user = db.relationship('User', backref='donations')
    campaign = db.relationship('Campaign', backref='donations')
    comment = db.relationship('Comment', backref='donations')

    def __repr__(self):
        return f"<Donation {self.donation_id} by User {self.user_id} on Campaign {self.campaign_id}>"

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True)