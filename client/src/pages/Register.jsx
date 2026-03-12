import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await api.post('/auth/register', formData);
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="card w-full max-w-md p-8">
                <h2 className="text-3xl font-bold text-slate-800 text-center mb-6">Create Account</h2>

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
                    <button type="submit" className="btn btn-primary w-full justify-center">Sign Up</button>
                </form>

                <p className="mt-4 text-center text-slate-600">
                    Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
