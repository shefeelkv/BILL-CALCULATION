import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import api from '../api';

const Notepad = () => {
    const [title, setTitle] = useState('');
    const [items, setItems] = useState([{ item_name: '', price: 0 }]);
    const total = items.reduce((sum, item) => sum + parseFloat(item.price), 0);

    const addItem = () => {
        setItems([...items, { item_name: '', price: 0 }]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const saveNote = async () => {
        if (!title) return alert('Please enter a note title');
        try {
            await api.post('/notes', { title, items });
            alert('Note saved successfully!');
            setTitle('');
            setItems([{ item_name: '', price: 0 }]);
        } catch (err) {
            console.error(err);
            alert('Failed to save note');
        }
    };

    return (
        <div className="card max-w-2xl mx-auto bg-yellow-50 border-yellow-200">
            <div className="flex justify-between items-center mb-6 border-b border-yellow-200 pb-4">
                <input
                    type="text"
                    className="text-2xl font-bold bg-transparent border-none placeholder-yellow-600/50 text-slate-800 w-full focus:ring-0"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Untitled Note..."
                />
                <button onClick={saveNote} className="btn bg-yellow-500 hover:bg-yellow-600 text-white shrink-0 ml-4">
                    <Save size={18} /> Save Note
                </button>
            </div>

            <div className="space-y-2 mb-6">
                {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center group">
                        <div className="w-8 flex justify-center text-slate-400 text-sm">{index + 1}.</div>
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-b border-yellow-200 focus:border-yellow-500 p-2"
                            value={item.item_name}
                            onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                            placeholder="Item details..."
                        />
                        <div className="w-32 relative">
                            <span className="absolute left-2 top-2 text-slate-400">$</span>
                            <input
                                type="number"
                                min="0"
                                className="w-full bg-transparent border-b border-yellow-200 focus:border-yellow-500 p-2 pl-6"
                                value={item.price}
                                onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <button onClick={() => removeItem(index)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-yellow-200">
                <button onClick={addItem} className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1">
                    <Plus size={18} /> Add Line
                </button>
                <div className="text-right">
                    <p className="text-sm text-yellow-700 font-medium">Total Estimate</p>
                    <p className="text-2xl font-bold text-slate-800">${total.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
};

export default Notepad;
