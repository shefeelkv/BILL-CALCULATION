import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Calendar, Target, TrendingUp, ChevronRight, X } from 'lucide-react';

const ChitFunds = () => {
    const [funds, setFunds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        target_amount: '',
        target_date: '',
        description: ''
    });

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchFunds();
    }, []);

    const fetchFunds = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/chit-funds`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFunds(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch funds', err);
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/chit-funds`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsModalOpen(false);
            setFormData({ name: '', target_amount: '', target_date: '', description: '' });
            fetchFunds();
        } catch (err) {
            alert('Error creating fund: ' + err.response?.data?.error);
        }
    };

    const getProgressColor = (percent) => {
        if (percent >= 100) return 'bg-emerald-500';
        if (percent >= 70) return 'bg-blue-500';
        if (percent >= 40) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Chit Funds</h1>
                    <p className="text-slate-500 mt-1">Manage your savings and targets</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-blue-200"
                >
                    <Plus size={20} />
                    <span>Create Fund</span>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : funds.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-20 text-center">
                    <Target size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No Chit Funds Yet</h3>
                    <p className="text-slate-500 mb-6">Start your first saving target today</p>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        + Create Your First Fund
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {funds.map(fund => {
                        const progress = Math.min(Math.round((fund.current_balance / fund.target_amount) * 100), 100);
                        return (
                            <a 
                                href={`/chit-funds/${fund.id}`}
                                key={fund.id}
                                className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                        <TrendingUp size={24} />
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        fund.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                        {fund.status}
                                    </span>
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-900 mb-1">{fund.name}</h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-1">{fund.description || 'No description'}</p>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-slate-500 font-medium">Progress</span>
                                            <span className="text-slate-900 font-bold">{progress}%</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${getProgressColor(progress)}`} 
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between pt-2 border-t border-slate-50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Balance</span>
                                            <span className="text-lg font-bold text-slate-900">₹{fund.current_balance.toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Target</span>
                                            <span className="text-lg font-bold text-blue-600">₹{fund.target_amount.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                                        <Calendar size={12} />
                                        <span>Target Date: {new Date(fund.target_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl scale-in-center">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">New saving Target</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Fund Name</label>
                                <input 
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="e.g., Home Down Payment"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Target (₹)</label>
                                    <input 
                                        required
                                        type="number"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="50000"
                                        value={formData.target_amount}
                                        onChange={e => setFormData({...formData, target_amount: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Due Date</label>
                                    <input 
                                        required
                                        type="date"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={formData.target_date}
                                        onChange={e => setFormData({...formData, target_date: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Description</label>
                                <textarea 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    rows="3"
                                    placeholder="Brief details about this saving goal..."
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                            <button 
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-200 mt-2"
                            >
                                Start Saving Now
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChitFunds;
