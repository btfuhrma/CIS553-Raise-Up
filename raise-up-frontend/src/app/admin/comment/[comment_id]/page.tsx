'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Comment = {
    content: string;
    username: string;
    comment_id: number;
};

export default function EditComment({ params }: { params: { comment_id: string } }) {
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState<Comment>();
    const { comment_id } = params;
    const router = useRouter();
    const [formData, setFormData] = useState({
        content: '',
    });

    useEffect(() => {
        fetch(`http://localhost:5000/api/comment/get?comment_id=${comment_id}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch comments');
                return res.json();
            })
            .then((data) => {
                setComment(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    });

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
            const res = await fetch(`http://localhost:5000/api/comment/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    comment_id: comment_id,
                    content: formData.content,
                 }),
                 credentials: 'include',
            });

            if (!res.ok) throw new Error('Failed to update Comment');
            alert('Campaign updated successfully');
            router.push('/admin');
        } catch (error) {
            console.error(error);
            alert('An error occurred while updating the Comment');
        } finally {
            setLoading(false);
        }
    };
    const handleRemove = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`http://localhost:5000/api/comment/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    comment_id: comment_id,
                 }),
                 credentials: 'include',
            });

            if (!res.ok) throw new Error('Failed to remove Comment');
            alert('Campaign updated successfully');
            router.push('/admin');
        } catch (error) {
            console.error(error);
            alert('An error occurred while updating the Comment');
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
                ) : !comment ? (
                    <div>
                        <p>Comment not found</p>
                    </div>
                ) : (
                    <div className="w-full flex justify-center text-center">
                        <div className="w-[50%] bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold mb-4 text-black">Edit comment</h2>
                            <Link href={`/admin/comment`} key={comment.comment_id} className="px-4 py-2 bg-indigo-400 text-white rounded-lg">Edit Comment</Link>
                            <form onSubmit={handleSubmit} className="space-y-4 text-black">
                                <div>
                                    <label htmlFor="content" className="block text-left font-medium text-gray-700">
                                        Content
                                    </label>
                                    <textarea
                                        id="content"
                                        name="content"
                                        value={formData.content}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>


                                <div className="flex">
                                    <div className="w-full mx-2">
                                        <button
                                            type="submit"
                                            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                                            disabled={loading}
                                        >
                                            {loading ? 'Updating...' : 'Update Campaign'}
                                        </button>
                                    </div>
                                    <div className="w-full mx-2">
                                        <form onSubmit={handleRemove}>
                                            <button
                                                type="submit"
                                                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                                                disabled={loading}
                                            >
                                                {loading ? 'Updating...' : 'Remove Campaign'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
