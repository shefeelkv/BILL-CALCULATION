import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Edit, Trash2, Download } from 'lucide-react';
import api from '../api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const BillDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBill = async () => {
            try {
                const res = await api.get(`/bills/${id}`);
                setBill(res.data);
            } catch (err) {
                console.error(err);
                alert('Failed to load bill details');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchBill();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this bill?')) {
            try {
                await api.delete(`/bills/${id}`);
                navigate('/dashboard');
            } catch {
                alert('Failed to delete bill');
            }
        }
    };

    const exportPDF = () => {
        if (!bill) return;
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('INVOICE', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Invoice #: ${bill.id}`, 14, 40);
        doc.text(`Date: ${new Date(bill.created_at).toLocaleDateString()}`, 14, 46);
        doc.text(`Customer: ${bill.customer_name}`, 14, 52);

        const tableColumn = ["Product", "Qty", "Rate", "Amount"];
        const tableRows = bill.items.map(item => [
            item.product_name,
            item.quantity,
            `$${item.rate}`,
            `$${item.amount.toFixed(2)}`
        ]);

        doc.autoTable({
            startY: 60,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] },
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.text(`Grand Total: $${bill.total_amount.toFixed(2)}`, 14, finalY);

        doc.save(`invoice_${bill.id}.pdf`);
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Loading invoice...</div>;
    if (!bill) return null;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>
                <div className="flex gap-3">
                    <button onClick={exportPDF} className="btn btn-outline flex items-center gap-2">
                        <Download size={18} /> PDF
                    </button>
                    <button onClick={() => window.print()} className="btn btn-outline flex items-center gap-2">
                        <Printer size={18} /> Print
                    </button>
                    <button onClick={() => navigate(`/edit-bill/${id}`)} className="btn btn-primary flex items-center gap-2">
                        <Edit size={18} /> Edit
                    </button>
                    <button onClick={handleDelete} className="btn btn-danger flex items-center gap-2">
                        <Trash2 size={18} /> Delete
                    </button>
                </div>
            </div>

            {/* Invoice Card */}
            <div className="card p-12 bg-white shadow-lg print:shadow-none print:border-none">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">INVOICE</h1>
                        <p className="text-slate-500 mt-1">#{String(bill.id).padStart(6, '0')}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-xl font-semibold text-slate-700">Bill To:</h3>
                        <p className="text-lg text-slate-800 mt-1">{bill.customer_name}</p>
                        <p className="text-slate-500 mt-2">Date: {new Date(bill.created_at).toLocaleDateString()}</p>
                    </div>
                </div>

                <table className="w-full mb-8">
                    <thead>
                        <tr className="bg-slate-50 border-y border-slate-200">
                            <th className="py-4 pl-4 text-left font-semibold text-slate-600 uppercase text-sm tracking-wider">Item Description</th>
                            <th className="py-4 text-center font-semibold text-slate-600 uppercase text-sm tracking-wider">Qty</th>
                            <th className="py-4 text-right font-semibold text-slate-600 uppercase text-sm tracking-wider">Rate</th>
                            <th className="py-4 pr-4 text-right font-semibold text-slate-600 uppercase text-sm tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {bill.items.map((item, i) => (
                            <tr key={i}>
                                <td className="py-4 pl-4 text-slate-800 font-medium">{item.product_name}</td>
                                <td className="py-4 text-center text-slate-600">{item.quantity}</td>
                                <td className="py-4 text-right text-slate-600">${item.rate.toFixed(2)}</td>
                                <td className="py-4 pr-4 text-right text-slate-800 font-semibold">${item.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end border-t border-slate-200 pt-6">
                    <div className="w-64">
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-600">Subtotal</span>
                            <span className="font-medium text-slate-800">${bill.total_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="text-slate-600">Tax (0%)</span>
                            <span className="font-medium text-slate-800">$0.00</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-4">
                            <span className="text-lg font-bold text-slate-800">Grand Total</span>
                            <span className="text-xl font-bold text-blue-600">${bill.total_amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillDetails;
