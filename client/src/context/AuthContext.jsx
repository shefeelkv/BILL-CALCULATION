import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './AuthContextInstance';
export { AuthContext };

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    });
    const loading = false;
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && user) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, [user]);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        navigate('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
