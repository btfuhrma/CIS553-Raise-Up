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
    const [loading, setLoading] = useState(true);
    const { campaign_id } = params;

    useEffect(() => {
        if (!campaign_id) return;

        fetch(`http://localhost:5000/api/campaign/get?campaign_id=${campaign_id}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch campaign');
                return res.json();
            })
            .then((data) => {
                setCampaign(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    }, [campaign_id]);

    // if (loading) {
    //     return <p>Loading...</p>;
    // }

    if (!campaign) {
        return <p>Campaign not found.</p>;
    }

    return (
        <div className="min-h-screen w-full h-full bg-gray-100 justify-center place-items-center">
            <nav className="w-full max-h-32 h-32 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
                <div className="flex items-center justify-between relative h-full w-full px-4">
                    <img src="/favicon.ico" alt="Raise Up Logo" className="h-[90%]" />
                    <span className="text-4xl font-bold text-white absolute left-1/2 -translate-x-1/2">Raise Up Admin Page</span>
                    <div className="h-full px-4 flex justify-center items-center space-x-5">
                        <Link href="/admin" className="px-4 py-2 bg-indigo-400 text-white rounded-lg float-left max-h-[30%]">Admin</Link>
                        <Link href={"/login"} className="px-4 py-2 bg-indigo-400 text-white rounded-lg float-left max-h-[30%]">Login</Link>
                    </div>
                </div>
            </nav>


            <div className="relative inset-x-0 top-0 w-full items-center justify-between text-sm px-24 pt-12">
                {!campaign ? 
                    <div>
                        
                    </div>
                :    
                    <div>

                    </div>
                }

            </div>
        </div>
    );
}
