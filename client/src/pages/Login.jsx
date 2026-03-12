import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await api.post('/auth/login', formData);
            login(res.data.token, res.data.user);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="card w-full max-w-md p-8">
                <h2 className="text-3xl font-bold text-slate-800 text-center mb-6">Welcome Back</h2>

                {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Username</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Password</label>
                        <input
                            type="password"
                            className="input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full justify-center">Login</button>
                </form>

                <p className="mt-4 text-center text-slate-600">
                    Don't have an account? <Link to="/register" className="text-blue-600 font-medium hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
