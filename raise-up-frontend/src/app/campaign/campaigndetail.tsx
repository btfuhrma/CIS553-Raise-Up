import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

interface Campaign {
  id: string;
  title: string;
  description: string;
  image_url: string;
  current_amount: number;
  goal_amount: number;
}

const CampaignDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchCampaign = async () => {
      try {
        const response = await axios.get(`/api/campaigns/${id}`);
        setCampaign(response.data);
      } catch (error) {
        console.error("Error fetching campaign:", error);
      }
    };

    fetchCampaign();
  }, [id]);

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

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const progress = (campaign.current_amount / campaign.goal_amount) * 100;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-gray-100 min-h-screen rounded-md">
      <div className="mb-8 rounded-md overflow-hidden">
        <img
          src={campaign.image_url || "/default-campaign-image.jpg"}
          alt={campaign.title}
          className="w-full h-96 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/default-campaign-image.jpg";
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{campaign.title}</h1>
          <div className="bg-white p-6 rounded-md shadow-md">
            <p className="text-gray-700">{campaign.description}</p>
          </div>
        </div>

        <aside className="sticky top-8">
          <div className="bg-white p-6 rounded-md shadow-md">
            <div className="mb-4">
              <div className="h-3 bg-gray-200 rounded-md overflow-hidden">
                <div
                  className="h-full bg-gray-800"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{`${campaign.current_amount} raised of ${campaign.goal_amount} goal`}</p>
            </div>

            <button className="w-full py-3 bg-gray-800 text-white rounded-md font-medium hover:bg-gray-700 mb-4">
              Donate Now
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button
                className="py-2 px-4 border-2 border-gray-300 rounded-md text-gray-800 hover:border-gray-800 hover:bg-gray-200"
                onClick={handleShare}
              >
                {showCopiedMessage ? "Link Copied!" : "Share"}
              </button>
              <button className="py-2 px-4 border-2 border-gray-300 rounded-md text-gray-800 hover:border-gray-800 hover:bg-gray-200">
                Follow
              </button>
            </div>

            {showCopiedMessage && (
              <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md">
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
