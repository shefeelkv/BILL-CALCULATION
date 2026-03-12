import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Clock, Trash2, Calendar, Target, DollarSign } from 'lucide-react';

const ChitFundDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fund, setFund] = useState(null);
    const [isTransModalOpen, setIsTransModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [transData, setTransData] = useState({
        transaction_type: 'ADD',
        amount: '',
        description: ''
    });

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchFundDetails();
    }, [id]);

    const fetchFundDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/chit-funds/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFund(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch fund details', err);
            setLoading(false);
        }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/chit-funds/${id}/transactions`, transData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsTransModalOpen(false);
            setTransData({ transaction_type: 'ADD', amount: '', description: '' });
            fetchFundDetails();
        } catch (err) {
            alert('Error: ' + err.response?.data?.error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this fund? This action cannot be undone.')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/chit-funds/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/chit-funds');
        } catch (err) {
            alert('Error deleting fund');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!fund) return <div className="text-center py-20 text-slate-500">Fund not found.</div>;

    const progress = Math.min(Math.round((fund.current_balance / fund.target_amount) * 100), 100);

    return (
        <div className="max-w-5xl mx-auto">
            <button 
                onClick={() => navigate('/chit-funds')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-medium transition-colors"
            >
                <ArrowLeft size={20} />
                <span>Back to Chit Funds</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Summary Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full -z-10" />
                        
                        <div className="flex justify-between items-start mb-6">
                            <h1 className="text-2xl font-bold text-slate-900">{fund.name}</h1>
                            <button onClick={handleDelete} className="text-rose-400 hover:text-rose-600 transition-colors">
                                <Trash2 size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1">Current Balance</span>
                                <div className="text-4xl font-black text-slate-900 leading-none">₹{fund.current_balance.toLocaleString()}</div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-slate-500">Progress</span>
                                    <span className="text-blue-600">{progress}%</span>
                                </div>
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-600 transition-all duration-1000" 
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Target</span>
                                    <span className="text-sm font-bold text-slate-700">₹{fund.target_amount.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Due Date</span>
                                    <span className="text-sm font-bold text-slate-700">{new Date(fund.target_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsTransModalOpen(true)}
                            className="w-full mt-8 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-slate-200 flex items-center justify-center gap-2"
                        >
                            <Plus size={20} />
                            <span>Add Money</span>
                        </button>
                    </div>

                    <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold opacity-80 text-sm">Remaining Goal</h3>
                            <p className="text-2xl font-black">₹{(fund.target_amount - fund.current_balance).toLocaleString()}</p>
                        </div>
                        <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Target size={24} />
                        </div>
                    </div>
                </div>

                {/* Right Side: Transaction History */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="font-bold text-slate-900 flex items-center gap-2">
                                <Clock size={18} className="text-blue-600" />
                                <span>Transaction History</span>
                            </h2>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{fund.transactions?.length || 0} Records</span>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {fund.transactions?.length === 0 ? (
                                <div className="text-center py-20 text-slate-400">
                                    No transactions recorded yet.
                                </div>
                            ) : (
                                fund.transactions.map(tx => (
                                    <div key={tx.id} className="p-6 hover:bg-slate-50/80 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                                                tx.transaction_type === 'ADD' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                            }`}>
                                                {tx.transaction_type === 'ADD' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{tx.transaction_type === 'ADD' ? 'Investment' : 'Withdrawal'}</h4>
                                                <p className="text-sm text-slate-500">{tx.description || 'General transaction'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-lg font-black ${
                                                tx.transaction_type === 'ADD' ? 'text-emerald-600' : 'text-rose-600'
                                            }`}>
                                                {tx.transaction_type === 'ADD' ? '+' : '-'}₹{parseFloat(tx.amount).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-slate-400 font-medium">
                                                {new Date(tx.date).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Modal */}
            {isTransModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl scale-in-center">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Manage Funds</h2>
                            <button onClick={() => setIsTransModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddTransaction} className="space-y-6">
                            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                                <button
                                    type="button"
                                    onClick={() => setTransData({...transData, transaction_type: 'ADD'})}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                                        transData.transaction_type === 'ADD' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
                                    }`}
                                >
                                    <Plus size={18} />
                                    <span>Add</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTransData({...transData, transaction_type: 'WITHDRAW'})}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                                        transData.transaction_type === 'WITHDRAW' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'
                                    }`}
                                >
                                    <TrendingDown size={18} />
                                    <span>Withdraw</span>
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Amount (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input 
                                        required
                                        type="number"
                                        className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xl font-bold"
                                        placeholder="0.00"
                                        value={transData.amount}
                                        onChange={e => setTransData({...transData, amount: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Note (Optional)</label>
                                <input 
                                    className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Source or reason for withdrawal..."
                                    value={transData.description}
                                    onChange={e => setTransData({...transData, description: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit"
                                className={`w-full font-black py-5 rounded-2xl transition-all shadow-lg mt-2 text-white ${
                                    transData.transaction_type === 'ADD' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
                                }`}
                            >
                                Confirm {transData.transaction_type === 'ADD' ? 'Investment' : 'Withdrawal'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// SVG Placeholder for X (Close button)
const X = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export default ChitFundDetails;
