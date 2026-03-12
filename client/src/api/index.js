import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const fetchBills = () => api.get('/bills');
export const createBill = (data) => api.post('/bills', data);
export const updateBill = (id, data) => api.put(`/bills/${id}`, data);
export const deleteBill = (id) => api.delete(`/bills/${id}`);
export const getBill = (id) => api.get(`/bills/${id}`);

export const fetchNotes = () => api.get('/notes');
export const createNote = (data) => api.post('/notes', data);
export const updateNote = (id, data) => api.put(`/notes/${id}`, data);
export const deleteNote = (id) => api.delete(`/notes/${id}`);

export const fetchAnalytics = () => api.get('/analytics');

export default api;
