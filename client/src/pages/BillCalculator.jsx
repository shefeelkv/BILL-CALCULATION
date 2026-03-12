import React, { useState } from 'react';
import { Plus, Trash2, Save, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../api';

const BillCalculator = () => {
    const [customer, setCustomer] = useState('');
    const [items, setItems] = useState([{ product_name: '', quantity: 1, rate: 0 }]);
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

    const saveBill = async () => {
        if (!customer) return alert('Please enter customer name');
        try {
            await api.post('/bills', { customer_name: customer, items });
            alert('Bill saved successfully!');
            setCustomer('');
            setItems([{ product_name: '', quantity: 1, rate: 0 }]);
        } catch (err) {
            console.error(err);
            alert('Failed to save bill');
        }
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('INVOICE', 105, 20, null, null, 'center');

        doc.setFontSize(12);
        doc.text(`Customer: ${customer}`, 20, 40);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);

        const tableColumn = ["Item", "Quantity", "Rate", "Amount"];
        const tableRows = items.map(item => [
            item.product_name,
            item.quantity,
            `$${item.rate}`,
            `$${(item.quantity * item.rate).toFixed(2)}`
        ]);

        doc.autoTable({
            startY: 60,
            head: [tableColumn],
            body: tableRows,
        });

        doc.text(`Total: $${total.toFixed(2)}`, 140, doc.lastAutoTable.finalY + 20);
        doc.save(`invoice_${Date.now()}.pdf`);
    };

    return (
        <div className="card max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">New Bill Calculator</h2>
                <div className="flex gap-2">
                    <button onClick={saveBill} className="btn btn-primary">
                        <Save size={18} /> Save Record
                    </button>
                    <button onClick={exportPDF} className="btn btn-outline">
                        <Download size={18} /> Export PDF
                    </button>
                </div>
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
                                    {items.length > 1 && (
                                        <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-2">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
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

export default BillCalculator;
