'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import '../styles/campaign-form.css';

interface FormData {
  title: string;
  description: string;
  goal_amount: string;
  image: File | null;
}

const CampaignForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    goal_amount: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('goal_amount', formData.goal_amount);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      console.log('Sending data:', {
        title: formData.title,
        description: formData.description,
        goal_amount: formData.goal_amount,
        hasImage: !!formData.image
      });

      const response = await axios.post('http://localhost:5000/api/campaigns', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      console.log('Response:', {
        status: response.status,
        data: response.data
      });
      
      if (response.status === 201) {
        const campaignId = response.data.campaign_id;
        console.log('Navigating to:', `/campaign/${campaignId}`);
        try {
          await router.push(`/campaign/${campaignId}`);
        } catch (navError) {
          console.error('Navigation error:', navError);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error creating campaign:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
          config: error.config
        });
      } else {
        console.error('Error creating campaign:', error);
      }
      alert('Failed to create campaign. Please try again.');
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
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Give your campaign a title"
            required
          />
        </div>

        <div className="form-group">
          <label>Campaign Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Tell your story... Why are you raising funds?"
            rows={6}
            required
          />
        </div>

        <div className="form-group">
          <label>Fundraising Goal ($)</label>
          <input
            type="number"
            value={formData.goal_amount}
            onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
            placeholder="Enter amount needed"
            required
          />
        </div>

        <div className="form-group">
          <label>Campaign Image</label>
          <div className="image-upload-area">
            {imagePreview ? (
              <div className="image-preview">
                <img
                  src={imagePreview}
                  alt="Preview"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, image: null });
                    setImagePreview(null);
                  }}
                  className="remove-image"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <span>Click to upload campaign image</span>
                <small>Recommended: 1200x630 pixels</small>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
              id="campaign-image"
            />
          </div>
        </div>

        <button type="submit" className="submit-button">
          Launch Campaign
        </button>
      </form>
    </div>
  );
};

export default CampaignForm; 