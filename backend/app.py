from flask import Flask, request, jsonify, send_from_directory, url_for
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from models import db, Campaign, User

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {"origins": "*"},
    r"/uploads/*": {"origins": "*"}
})

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///campaigns.db'
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

db.init_app(app)

# Create upload folder if it doesn't exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/api/campaigns', methods=['POST'])
def create_campaign():
    data = request.form
    image = request.files.get('image')
    
    if image:
        filename = secure_filename(image.filename)
        image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        image_url = url_for('uploaded_file', filename=filename, _external=True)
    else:
        image_url = None

    campaign = Campaign(
        title=data['title'],
        description=data['description'],
        goal_amount=float(data['goal_amount']),
        image_url=image_url,
        user_id=1  # Hardcoded for simplicity
    )
    
    db.session.add(campaign)
    db.session.commit()
    
    # Return the campaign data including the ID
    return jsonify({
        'message': 'Campaign created successfully',
        'campaign': {
            'id': campaign.id,
            'title': campaign.title,
            'description': campaign.description,
            'goal_amount': campaign.goal_amount,
            'current_amount': 0,
            'image_url': campaign.image_url
        }
    })

@app.route('/api/campaigns', methods=['GET'])
def get_campaigns():
    campaigns = Campaign.query.all()
    return jsonify([{
        'id': c.id,
        'title': c.title,
        'description': c.description,
        'goal_amount': c.goal_amount,
        'current_amount': c.current_amount,
        'image_url': c.image_url
    } for c in campaigns])

@app.route('/api/campaigns/<int:campaign_id>', methods=['GET'])
def get_campaign(campaign_id):
    campaign = Campaign.query.get_or_404(campaign_id)
    return jsonify({
        'id': campaign.id,
        'title': campaign.title,
        'description': campaign.description,
        'goal_amount': campaign.goal_amount,
        'current_amount': campaign.current_amount or 0,
        'image_url': campaign.image_url
    })

# Add this route to serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)