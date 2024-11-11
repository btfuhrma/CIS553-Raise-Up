import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './CampaignDetail.css';

function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/campaigns/${id}`);
        setCampaign(response.data);
      } catch (error) {
        console.error('Error fetching campaign:', error);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleShare = async () => {
    const currentUrl = window.location.href;
    
    try {
      await navigator.clipboard.writeText(currentUrl);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000); // Hide message after 2 seconds
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  if (!campaign) return <div className="loading">Loading...</div>;

  const progress = (campaign.current_amount / campaign.goal_amount) * 100;

  return (
    <div className="campaign-detail">
      <div className="campaign-header">
        <img 
          src={campaign.image_url || '/default-campaign-image.jpg'} 
          alt={campaign.title} 
          className="campaign-image"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = '/default-campaign-image.jpg';
          }}
        />
      </div>

      <div className="campaign-content">
        <div className="campaign-main">
          <h1>{campaign.title}</h1>
          <div className="campaign-story">
            <p>{campaign.description}</p>
          </div>
        </div>

        <div className="campaign-sidebar">
          <div className="fundraising-stats">
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{width: `${progress}%`}}
              ></div>
            </div>
            
            <div className="stats">
              <div className="raised">
                <h3>${campaign.current_amount}</h3>
                <p>raised of ${campaign.goal_amount} goal</p>
              </div>
              <div className="donors">
                <h3>0</h3>
                <p>donors</p>
              </div>
            </div>

            <button className="donate-button">
              Donate Now
            </button>

            <div className="share-buttons">
              <button className="share-btn" onClick={handleShare}>
                {showCopiedMessage ? 'Link Copied!' : 'Share'}
              </button>
              <button className="follow-btn">Follow</button>
            </div>
            
            {showCopiedMessage && (
              <div className="copy-message">
                Campaign link copied to clipboard!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignDetail; 