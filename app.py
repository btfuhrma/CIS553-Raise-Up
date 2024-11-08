from flask import Flask, render_template, request, flash, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///RaiseUp.db'
db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = 'user'
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
    top_campaigns = Campaign.query.order_by(Campaign.current_amount.desc()).limit(2).all()
    return render_template('index.html', top_campaigns=top_campaigns)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        user = User.query.filter_by(email=email).first()

        if user and user.check_password(password):
            return redirect(url_for('index.html'))
        else:
            flash('Invalid credentials. Please try again.', 'danger')

    return render_template('login.html')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']

        if User.query.filter_by(email=email).first():
            flash('Email already exists. Please log in.', 'danger')
            return redirect(url_for('login'))

        new_user = User(name=name, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        flash('Account created successfully! Please log in.', 'success')
        return redirect(url_for('login'))

    return render_template('signup.html')

@app.route('/search', methods=['GET', 'POST'])
def searchCampaigns():
    query = request.form.get('search_query')
    results = []

    if query:
        results = Campaign.query.filter(Campaign.title.ilike(f'%{query}%')).all()

    return render_template('search_results.html', results=results)

if __name__ == "__main__":
    app.run(debug=True)