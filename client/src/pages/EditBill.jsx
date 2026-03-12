import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import api from '../api';

const EditBill = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState('');
    const [items, setItems] = useState([]);
    useEffect(() => {
        const fetchBillDetails = async () => {
            try {
                const res = await api.get(`/bills/${id}`);
                setCustomer(res.data.customer_name);
                setItems(res.data.items);
                setLoading(false);
            } catch (err) {
                console.error(err);
                alert('Failed to fetch bill details');
                navigate('/dashboard');
            }
        };
        fetchBillDetails();
    }, [id, navigate]);

    const total = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);



    const addItem = () => {
        setItems([...items, { product_name: '', quantity: 1, rate: 0 }]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const updateBill = async () => {
        if (!customer) return alert('Please enter customer name');
        try {
            await api.put(`/bills/${id}`, { customer_name: customer, items });
            alert('Bill updated successfully!');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to update bill');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading bill details...</div>;

    return (
        <div className="card max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-800">Edit Bill #{id}</h2>
                </div>
                <button onClick={updateBill} className="btn btn-primary">
                    <Save size={18} /> Save Changes
                </button>
            </div>

            <div className="mb-6">
                <label className="label">Customer / Company Name</label>
                <input
                    type="text"
                    className="input max-w-md"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="Enter name..."
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full mb-6">
                    <thead>
                        <tr className="bg-slate-50">
                            <th className="w-1/2">Product Name</th>
                            <th className="w-24">Qty</th>
                            <th className="w-32">Rate</th>
                            <th className="w-32">Amount</th>
                            <th className="w-16">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        type="text"
                                        className="input border-transparent focus:border-blue-500 bg-transparent"
                                        value={item.product_name}
                                        onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                                        placeholder="Item name"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        min="1"
                                        className="input border-transparent focus:border-blue-500 bg-transparent"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                    />
                                </td>
                                <td>
                                    <div className="relative">
                                        <span className="absolute left-2 top-2 text-slate-400">$</span>
                                        <input
                                            type="number"
                                            min="0"
                                            className="input pl-6 border-transparent focus:border-blue-500 bg-transparent"
                                            value={item.rate}
                                            onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                </td>
                                <td className="font-medium text-slate-700">
                                    ${(item.quantity * item.rate).toFixed(2)}
                                </td>
                                <td>
                                    <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-2">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center border-t pt-6">
                <button onClick={addItem} className="btn btn-outline border-dashed">
                    <Plus size={18} /> Add Item
                </button>
                <div className="text-right">
                    <p className="text-slate-500 text-sm">Grand Total</p>
                    <p className="text-3xl font-bold text-slate-800">${total.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
};

export default EditBill;
