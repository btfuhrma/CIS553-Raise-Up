'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import '../styles/campaign-detail.css';

interface Campaign {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  current_amount: number;
  goal_amount: number;
  created_at: string;
}

const CampaignDetail = () => {
  const params = useParams();
  const id = params.id;
  console.log('Campaign detail page loaded with ID:', id);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        console.log('Fetching campaign with ID:', id);
        const response = await axios.get(`http://localhost:5000/api/campaign/get?campaign_id=${id}`);
        console.log('Campaign data:', response.data);
        
        const campaignData: Campaign = {
          id: response.data.id.toString(),
          title: response.data.title,
          description: response.data.description,
          image_url: response.data.image_url,
          current_amount: response.data.current_amount,
          goal_amount: response.data.goal_amount,
          created_at: response.data.created_at
        };
        setCampaign(campaignData);
      } catch (error) {
        console.error("Error fetching campaign:", error);
        setError("Failed to load campaign details. Please try again later.");
      }
    };

    if (id) {
      fetchCampaign();
    }
  }, [id]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner"></div>
        <p className="text-gray-500 mt-4">Loading campaign details...</p>
      </div>
    );
  }

  const handleShare = async () => {
    const currentUrl = window.location.href;

    try {
      await navigator.clipboard.writeText(currentUrl);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  return (
    <div className="campaign-detail">
      <h1 className="campaign-title">{campaign.title}</h1>
      
      <div className="campaign-header">
        <img
          src={campaign.image_url ? 
            `http://localhost:5000${campaign.image_url}` : 
            '/placeholder-campaign.gif'}
          alt={campaign.title}
          className="campaign-image"
        />
      </div>

      <div className="campaign-content">
        <div className="campaign-main">
          <div className="campaign-story">
            <p>{campaign.description}</p>
            <p className="text-sm text-gray-500 mt-4">
              Created on: {new Date(campaign.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <aside className="campaign-sidebar">
          <div className="fundraising-stats">
            <div className="mb-4">
              <div className="progress-bar">
                <div
                  className="progress"
                  style={{ width: `${Math.min((campaign.current_amount / campaign.goal_amount) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                ${campaign.current_amount.toLocaleString()} raised of ${campaign.goal_amount.toLocaleString()} goal
              </p>
            </div>

            <button className="donate-button">
              Donate Now
            </button>

            <div className="share-buttons">
              <button
                className={`share-btn ${showCopiedMessage ? 'copied' : ''}`}
                onClick={handleShare}
              >
                {showCopiedMessage ? "Link Copied!" : "Share"}
              </button>
              <button 
                className="share-btn"
              >
                Follow
              </button>
            </div>

            {showCopiedMessage && (
              <div className="copy-message">
                Campaign link copied to clipboard!
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CampaignDetail;
