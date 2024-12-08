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

export default function Home() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [isStaff, setIsStaff] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetch('http://localhost:5000/api/user/isStaff', {method:"GET", credentials:'include'})
        .then((response) => response.json())
        .then((data) => {
            setIsStaff(data.is_staff);
        })
        .catch((error) => {
            console.error("Error fetching user data:", error);
        });
        const delayDebounceFn = setTimeout(() => {
            if (query.length > 2) {
                setLoading(true);
                fetch(`http://localhost:5000/api/campaigns/search?query=${query}`)
                    .then((response) => response.json())
                    .then((data) => {
                        setCampaigns(data);
                        setLoading(false);
                    })
                    .catch((error) => {
                        console.error("Error fetching campaigns:", error);
                        setLoading(false);
                    });
            } else {
                setCampaigns([]);
            }
        }, 750);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className="min-h-screen w-full h-full bg-gray-100 justify-center place-items-center">
            <nav className="w-full max-h-32 h-32 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
                <div className="flex items-center justify-between relative h-full w-full px-4">
                    <img src="/favicon.ico" alt="Raise Up Logo" className="h-[90%]" />
                    <span className="text-4xl font-bold text-white absolute left-1/2 -translate-x-1/2">Raise Up Admin Page</span>
                    <div className="h-full px-4 flex justify-center items-center space-x-5">
                    {isStaff && (
                            <Link href="/admin" className="px-4 py-2 bg-indigo-400 text-white rounded-lg float-left max-h-[30%]">Admin</Link>
                    )}
                            <Link href={"/login"} className="px-4 py-2 bg-indigo-400 text-white rounded-lg float-left max-h-[30%]">Login</Link>
                    </div>
                </div>
            </nav>

            <div className="flex justify-center mt-4 px-4 max-h-14 w-full items-center">
                <input
                    id="query"
                    name="query"
                    type="query"
                    autoComplete="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 max-w-[30%]"
                    placeholder="Search Campaigns"
                />
            </div>

            <div className="relative inset-x-0 top-0 w-full items-center justify-between text-sm px-24 pt-12">
                <div className="items-center w-full justify-center">
                    <h1 className="text-black text-2xl font-bold items-center text-center">Modifiable Campaigns</h1>
                </div>
                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-slate-400 text-lg">Loading...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 grid-cols-2 grid-cols-3 gap-6 my-6">
                        {campaigns.map((campaign: any) => (
                            <Link href={`/admin/edit/${campaign.campaign_id}`} key={campaign.campaign_id}>
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-500 transition-colors h-full flex flex-col">
                                    <h3 className="text-xl font-semibold mb-2 text-white">{campaign.title}</h3>
                                    <img src={`http://localhost:5000/static/images/temp.png`} alt="Campaign Image" className="max-h-32 max-w-32" />
                                    <p className="text-slate-400 mb-4 flex-grow">{campaign.description}</p>
                                    <div className="text-emerald-400 font-bold text-lg mt-auto">
                                        ${campaign.goal_amount} Goal
                                    </div>
                                    <div className="text-emerald-400 font-bold text-lg mt-auto">
                                        ${campaign.current_amount} raised
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
