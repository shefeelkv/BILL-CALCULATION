import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';

import BillCalculator from './pages/BillCalculator';
import Notepad from './pages/Notepad';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';

import EditBill from './pages/EditBill';
import EditNote from './pages/EditNote';
import BillDetails from './pages/BillDetails';
import NoteDetails from './pages/NoteDetails';
import ChitFunds from './pages/ChitFunds';
import ChitFundDetails from './pages/ChitFundDetails';

import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/new-bill" element={<BillCalculator />} />
              <Route path="/notepad" element={<Notepad />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/edit-bill/:id" element={<EditBill />} />
              <Route path="/edit-note/:id" element={<EditNote />} />
              <Route path="/bills/:id" element={<BillDetails />} />
              <Route path="/notes/:id" element={<NoteDetails />} />
              <Route path="/chit-funds" element={<ChitFunds />} />
              <Route path="/chit-funds/:id" element={<ChitFundDetails />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
