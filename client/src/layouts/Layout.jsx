import React, { useContext } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { FileText, PlusCircle, PieChart, LogOut, ClipboardList } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
    const location = useLocation();
    const { logout, user } = useContext(AuthContext);

    const isActive = (path) => {
        return location.pathname === path ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800';
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-xl font-bold tracking-tight">SCSmartCalc</h1>
                    <p className="text-xs text-slate-400 mt-1">Enterprise Billing</p>
                    {user && <p className="text-xs text-blue-400 mt-2">Welcome, {user.username}</p>}
                </div>

                <nav className="flex-1 p-4 space-y-2">

                    <Link to="/new-bill" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/new-bill')}`}>
                        <PlusCircle size={20} />
                        <span>New Bill</span>
                    </Link>
                    <Link to="/notepad" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/notepad')}`}>
                        <FileText size={20} />
                        <span>Smart Notepad</span>
                    </Link>
                    <Link to="/dashboard" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/dashboard')}`}>
                        <ClipboardList size={20} />
                        <span>Records</span>
                    </Link>
                    <Link to="/analytics" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/analytics')}`}>
                        <PieChart size={20} />
                        <span>Analytics</span>
                    </Link>
                    <Link to="/chit-funds" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/chit-funds')}`}>
                        <ClipboardList size={20} />
                        <span>Chit Funds</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <button onClick={logout} className="flex items-center gap-3 p-3 w-full rounded-lg text-red-400 hover:bg-slate-800 transition-colors">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
