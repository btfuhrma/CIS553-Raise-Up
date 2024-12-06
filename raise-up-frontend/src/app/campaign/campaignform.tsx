import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

interface FormData {
  title: string;
  description: string;
  goal_amount: string;
  image: File | null;
}

const CampaignForm: React.FC = () => {
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

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("goal_amount", formData.goal_amount);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const response = await axios.post("/api/campaigns", data);
      if (response.data.campaign && response.data.campaign.id) {
        router.push(`/campaign/${response.data.campaign.id}`);
      } else {
        alert("Error creating campaign: No campaign ID received");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Error creating campaign. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Create Your Campaign</h1>
        <p className="text-gray-600">Share your story and start raising funds</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Campaign Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Give your campaign a title"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Campaign Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Tell your story... Why are you raising funds?"
            rows={6}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Fundraising Goal ($)</label>
          <input
            type="number"
            value={formData.goal_amount}
            onChange={(e) =>
              setFormData({ ...formData, goal_amount: e.target.value })
            }
            placeholder="Enter amount needed"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Campaign Image</label>
          <div
            className={`border-2 rounded-lg p-3 cursor-pointer ${
              imagePreview
                ? "border-gray-300"
                : "border-dashed border-gray-300 hover:border-gray-800"
            }`}
          >
            {imagePreview ? (
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <span>Click to upload campaign image</span>
                <small className="block mt-1">Recommended: 1200x630 pixels</small>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition"
        >
          Launch Campaign
        </button>
      </form>
    </div>
  );
};

export default CampaignForm;
