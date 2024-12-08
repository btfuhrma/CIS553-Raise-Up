'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type Comment = {
    content: string;
    username: string;
    comment_id: number;
};

export default function EditCommentList() {
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState<Comment[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const campaign_id = searchParams.get('campaign_id');

    useEffect(() => {
        if (!campaign_id) {
            console.error("Campaign ID is undefined");
            setLoading(false);
            return;
        }

        fetch(`http://localhost:5000/api/comment/list?campaign_id=${campaign_id}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch comments');
                return res.json();
            })
            .then((data) => {
                setComments(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    }, [campaign_id]); // Add dependency for campaign_id

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
                <div className="items-center w-full justify-center">
                    <h1 className="text-black text-2xl font-bold items-center text-center">Modifiable Comments</h1>
                </div>
                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-slate-400 text-lg">Loading...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
                        {comments.map((comment) => (
                            <Link href={`/admin/comment/edit/${comment.comment_id}`} key={comment.comment_id}>
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-500 transition-colors h-full flex flex-col">
                                    <h3 className="text-xl font-semibold mb-2 text-white">User: {comment.username}</h3>
                                    <p className="text-slate-400 mb-4 flex-grow">Comment: {comment.content}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
