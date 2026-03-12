import React, { useEffect, useState } from 'react';
import { fetchAnalytics } from '../api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Analytics = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchAnalytics().then(res => setData(res.data)).catch(console.error);
    }, []);

    if (!data) return <p className="text-slate-500">Loading analytics...</p>;

    const revenueData = {
        labels: ['Total Revenue', 'Monthly Revenue'],
        datasets: [
            {
                label: 'USD',
                data: [data.totalRevenue, data.monthlyRevenue],
                backgroundColor: ['rgba(59, 130, 246, 0.5)', 'rgba(16, 185, 129, 0.5)'],
                borderColor: ['rgb(59, 130, 246)', 'rgb(16, 185, 129)'],
                borderWidth: 1,
            },
        ],
    };


    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-800">Business Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold mb-4 text-slate-700">Revenue Overview</h3>
                    <Bar data={revenueData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold mb-4 text-slate-700">Detailed Stats</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between p-4 bg-blue-50 rounded-lg">
                            <span className="text-blue-700 font-medium">Total Lifetime Revenue</span>
                            <span className="text-blue-900 font-bold">${data.totalRevenue}</span>
                        </div>
                        <div className="flex justify-between p-4 bg-emerald-50 rounded-lg">
                            <span className="text-emerald-700 font-medium">This Month's Revenue</span>
                            <span className="text-emerald-900 font-bold">${data.monthlyRevenue}</span>
                        </div>
                        <div className="flex justify-between p-4 bg-amber-50 rounded-lg">
                            <span className="text-amber-700 font-medium">Total Invoices Generated</span>
                            <span className="text-amber-900 font-bold">{data.totalBills}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
