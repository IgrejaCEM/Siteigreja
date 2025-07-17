import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EventList from './pages/EventList';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CriarEvento from './pages/CriarEvento';
import PaymentSettings from './components/PaymentSettings';
import PaymentSummary from './components/PaymentSummary';
import PrivateRoute from './components/PrivateRoute';
import Inscricao from './pages/Inscricao';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/events" element={<EventList />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/inscricao/:slug" element={<Inscricao />} />
      
      {/* Rotas protegidas */}
      <Route path="/dashboard/*" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
        <Route path="eventos" element={<AdminDashboard />} />
        <Route path="criar-evento" element={<CriarEvento />} />
        <Route path="editar-evento/:id" element={<CriarEvento />} />
      </Route>
      
      <Route path="/events/:id/payment-settings" element={<PrivateRoute><PaymentSettings /></PrivateRoute>} />
      <Route path="/events/:id/payment-summary" element={<PrivateRoute><PaymentSummary /></PrivateRoute>} />
    </Routes>
  );
};

export default AppRoutes; 