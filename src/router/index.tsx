import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Restaurants from '@/pages/Restaurants';
import Lanchonetes from '@/pages/Lanchonetes';
import SavedPlaces from '@/pages/SavedPlaces';
import RestaurantDetails from '@/pages/RestaurantDetails';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import AdminDashboard from '@/pages/admin/Dashboard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const Router: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/restaurantes" element={<Restaurants />} />
      <Route path="/lanchonetes" element={<Lanchonetes />} />
      <Route path="/restaurante/:id" element={<RestaurantDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/salvos" element={<SavedPlaces />} />
      
      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default Router;