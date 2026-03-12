import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import api from '../api';

const NoteDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const res = await api.get(`/notes/${id}`);
                setNote(res.data);
            } catch {
                alert('Failed to load note details');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchNote();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await api.delete(`/notes/${id}`);
                navigate('/dashboard');
            } catch {
                alert('Failed to delete note');
            }
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Loading note...</div>;
    if (!note) return null;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>
                <div className="flex gap-2">
                    <button onClick={() => navigate(`/edit-note/${id}`)} className="btn bg-yellow-400 hover:bg-yellow-500 text-slate-900 flex items-center gap-2">
                        <Edit size={18} /> Edit
                    </button>
                    <button onClick={handleDelete} className="btn btn-danger flex items-center gap-2">
                        <Trash2 size={18} /> Delete
                    </button>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm p-8 relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400 rounded-t-lg"></div>

                <h1 className="text-3xl font-bold text-slate-800 mb-2">{note.title}</h1>
                <p className="text-sm text-yellow-700 mb-8">Created on {new Date(note.created_at).toLocaleDateString()}</p>

                <div className="space-y-4">
                    {note.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-yellow-200 pb-2 border-dashed">
                            <span className="text-lg text-slate-700 font-handwriting">{item.item_name}</span>
                            <span className="font-semibold text-slate-900">${item.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-4 border-t-2 border-yellow-200 flex justify-end">
                    <div className="text-right">
                        <p className="text-yellow-800 font-medium text-sm">Total Estimate</p>
                        <p className="text-3xl font-bold text-slate-900">${note.total_amount.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoteDetails;
