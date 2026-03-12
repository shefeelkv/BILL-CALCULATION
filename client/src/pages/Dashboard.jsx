import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { fetchBills, fetchNotes, deleteBill, deleteNote } from '../api';
import { Trash, FileText, Download, Edit } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('bills');
    const [bills, setBills] = useState([]);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [billsRes, notesRes] = await Promise.all([fetchBills(), fetchNotes()]);
            setBills(billsRes.data);
            setNotes(notesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;
        try {
            if (type === 'bill') {
                await deleteBill(id);
                setBills(bills.filter(b => b.id !== id));
            } else {
                await deleteNote(id);
                setNotes(notes.filter(n => n.id !== id));
            }
        } catch (err) {
            console.error(err);
            alert('Failed to delete');
        }
    };

    const exportBillPDF = async (bill) => {
        // Fetch details first including items
        try {
            const res = await api.get(`/bills/${bill.id}`);
            const fullBill = res.data;

            const doc = new jsPDF();
            doc.text('INVOICE', 105, 20, null, null, 'center');
            doc.text(`Customer: ${fullBill.customer_name}`, 20, 40);
            doc.text(`Date: ${new Date(fullBill.created_at).toLocaleDateString()}`, 20, 50);

            const tableRows = fullBill.items.map(item => [
                item.product_name,
                item.quantity,
                `$${item.rate}`,
                `$${(item.quantity * item.rate).toFixed(2)}`
            ]);

            doc.autoTable({
                startY: 60,
                head: [['Item', 'Qty', 'Rate', 'Amount']],
                body: tableRows,
            });

            doc.text(`Total: $${fullBill.total_amount}`, 140, doc.lastAutoTable.finalY + 20);
            doc.save(`invoice_${fullBill.id}.pdf`);
        } catch (err) {
            console.error(err);
            alert('Failed to generate PDF');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-slate-200">
                <button
                    className={`pb-4 px-2 font-medium ${activeTab === 'bills' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                    onClick={() => setActiveTab('bills')}
                >
                    Saved Bills ({bills.length})
                </button>
                <button
                    className={`pb-4 px-2 font-medium ${activeTab === 'notes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                    onClick={() => setActiveTab('notes')}
                >
                    Saved Notes ({notes.length})
                </button>
            </div>

            {loading ? (
                <p className="text-slate-500">Loading records...</p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {activeTab === 'bills' && bills.map(bill => (
                        <div key={bill.id} className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h4
                                        onClick={() => navigate(`/bills/${bill.id}`)}
                                        className="font-semibold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors"
                                    >
                                        {bill.customer_name}
                                    </h4>
                                    <p className="text-sm text-slate-500">#{bill.id} • {new Date(bill.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="font-bold text-slate-800">${parseFloat(bill.total_amount).toFixed(2)}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => exportBillPDF(bill)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Download PDF">
                                        <Download size={18} />
                                    </button>
                                    <button onClick={() => navigate(`/edit-bill/${bill.id}`)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Edit">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(bill.id, 'bill')} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                                        <Trash size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {activeTab === 'notes' && notes.map(note => (
                        <div key={note.id} className="bg-white p-4 rounded-lg border border-yellow-200 flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h4
                                        onClick={() => navigate(`/notes/${note.id}`)}
                                        className="font-semibold text-slate-800 cursor-pointer hover:text-yellow-600 transition-colors"
                                    >
                                        {note.title}
                                    </h4>
                                    <p className="text-sm text-slate-500">#{note.id} • {new Date(note.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="font-bold text-slate-800">${parseFloat(note.total_amount).toFixed(2)}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => navigate(`/edit-note/${note.id}`)} className="p-2 text-slate-400 hover:text-yellow-600 transition-colors" title="Edit">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(note.id, 'note')} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                                        <Trash size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {((activeTab === 'bills' && bills.length === 0) || (activeTab === 'notes' && notes.length === 0)) && (
                        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border-dashed border border-slate-200">
                            <p className="mb-4">No records found.</p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => navigate('/new-bill')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <FileText size={18} /> Create Bill
                                </button>
                                <button
                                    onClick={() => navigate('/notepad')}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                                >
                                    <FileText size={18} /> Create Note
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
