import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CampaignForm.css';

function CampaignForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_amount: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('goal_amount', formData.goal_amount);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/campaigns', data);
      console.log('Response:', response.data);
      if (response.data.campaign && response.data.campaign.id) {
        navigate(`/campaign/${response.data.campaign.id}`);
      } else {
        alert('Error creating campaign: No campaign ID received');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error creating campaign. Please try again.');
    }
  };

  return (
    <div className="campaign-form-container">
      <div className="form-header">
        <h1>Create Your Campaign</h1>
        <p>Share your story and start raising funds</p>
      </div>

      <form onSubmit={handleSubmit} className="campaign-form">
        <div className="form-group">
          <label>Campaign Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Give your campaign a title"
            required
          />
        </div>

        <div className="form-group">
          <label>Campaign Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Tell your story... Why are you raising funds?"
            rows="6"
            required
          />
        </div>

        <div className="form-group">
          <label>Fundraising Goal ($)</label>
          <input
            type="number"
            value={formData.goal_amount}
            onChange={(e) => setFormData({...formData, goal_amount: e.target.value})}
            placeholder="Enter amount needed"
            required
          />
        </div>

        <div className="form-group">
          <label>Campaign Image</label>
          <div className="image-upload-area">
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            ) : (
              <div className="upload-placeholder">
                <span>Click to upload campaign image</span>
                <small>Recommended: 1200x630 pixels</small>
              </div>
            )}
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="file-input"
            />
          </div>
        </div>

        <button type="submit" className="submit-button">
          Launch Campaign
        </button>
      </form>
    </div>
  );
}

export default CampaignForm; 