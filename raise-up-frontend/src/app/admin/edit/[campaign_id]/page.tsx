'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Campaign = {
    campaign_id: number;
    title: string;
    image: string;
    description: string;
    goal_amount: number;
    current_amount: number;
    created_at: Date;
};

export default function EditCampaign({ params }: { params: { campaign_id: string } }) {
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        image: '',
        description: '',
        goal_amount: '',
    });
    const [loading, setLoading] = useState(true);
    const { campaign_id } = params;
    const router = useRouter();

    useEffect(() => {
        if (!campaign_id) return;

        fetch(`http://localhost:5000/api/campaign/get?campaign_id=${campaign_id}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch campaign');
                return res.json();
            })
            .then((data) => {
                setCampaign(data);
                setFormData({
                    title: data.title || '',
                    image: data.image || '',
                    description: data.description || '',
                    goal_amount: data.goal_amount.toString() || '',
                });
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    }, [campaign_id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement| HTMLTextAreaElement> ) => {
        setFormData(prev => ({
          ...prev,
          [e.target.name]: e.target.value
        }))
      }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`http://localhost:5000/api/campaign/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    campaign_id: campaign_id,
                    title: formData.title,
                    description: formData.description,
                    goal_amount: formData.goal_amount,
                    image: formData.image,
                 }),
                 credentials: 'include',
            });

            if (!res.ok) throw new Error('Failed to update campaign');
            alert('Campaign updated successfully');
            router.push('/admin');
        } catch (error) {
            console.error(error);
            alert('An error occurred while updating the campaign');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full h-full bg-gray-100 flex flex-col items-center">
            <nav className="w-full max-h-32 h-32 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
                <div className="flex items-center justify-between relative h-full w-full px-4">
                    <img src="/favicon.ico" alt="Raise Up Logo" className="h-[90%]" />
                    <span className="text-4xl font-bold text-white absolute left-1/2 -translate-x-1/2">
                        Raise Up Admin Page
                    </span>
                    <div className="h-full px-4 flex justify-center items-center space-x-5">
                        <Link href="/admin" className="px-4 py-2 bg-indigo-400 text-white rounded-lg">
                            Admin
                        </Link>
                        <Link href="/login" className="px-4 py-2 bg-indigo-400 text-white rounded-lg">
                            Login
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="relative inset-x-0 top-0 w-full items-center justify-between text-sm px-24 pt-12">
                {loading ? (
                    <p>Loading...</p>
                ) : !campaign ? (
                    <div>
                        <p>Campaign not found</p>
                    </div>
                ) : (
                    <div className="w-full flex justify-center text-center">
                        <div className="w-[50%] bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold mb-4 text-black">Edit Campaign</h2>
                            <form onSubmit={handleSubmit} className="space-y-4 text-black">
                                <div>
                                    <label htmlFor="title" className="block text-left font-medium text-gray-700">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="image" className="block text-left font-medium text-gray-700">
                                        Image URL
                                    </label>
                                    <input
                                        type="text"
                                        id="image"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-left font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        rows={5}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="goal_amount" className="block text-left font-medium text-gray-700">
                                        Goal Amount
                                    </label>
                                    <input
                                        type="number"
                                        id="goal_amount"
                                        name="goal_amount"
                                        value={formData.goal_amount}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                                        disabled={loading}
                                    >
                                        {loading ? 'Updating...' : 'Update Campaign'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
