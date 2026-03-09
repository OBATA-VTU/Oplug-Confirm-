import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BuyAirtime from './pages/BuyAirtime';
import BuyData from './pages/BuyData';
import CableSubscription from './pages/CableSubscription';
import ElectricityPayment from './pages/ElectricityPayment';
import EducationPin from './pages/EducationPin';
import SmmServices from './pages/SmmServices';
import FundWallet from './pages/FundWallet';
import Support from './pages/Support';
import ReferAndEarn from './pages/ReferAndEarn';
import GiftCard from './pages/GiftCard';
import History from './pages/History';
import DeveloperAPI from './pages/DeveloperAPI';
import Profile from './pages/Profile';
import P2PTransfer from './pages/P2PTransfer';
import ProfileSetupModal from './components/ProfileSetupModal';

import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminPrices from './pages/AdminPrices';
import AdminSettings from './pages/AdminSettings';

import AdminNotifications from './pages/AdminNotifications';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, profile, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  if (adminOnly && !profile?.isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <>
      <ProfileSetupModal />
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fund" element={<FundWallet />} />
            <Route path="/airtime" element={<BuyAirtime />} />
            <Route path="/data" element={<BuyData />} />
            <Route path="/cable" element={<CableSubscription />} />
            <Route path="/electricity" element={<ElectricityPayment />} />
            <Route path="/education" element={<EducationPin />} />
            <Route path="/smm" element={<SmmServices />} />
            <Route path="/transfer" element={<P2PTransfer />} />
            <Route path="/support" element={<Support />} />
            <Route path="/refer" element={<ReferAndEarn />} />
            <Route path="/giftcard" element={<GiftCard />} />
            <Route path="/history" element={<History />} />
            <Route path="/developer" element={<DeveloperAPI />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<ProtectedRoute adminOnly><Layout /></ProtectedRoute>}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/prices" element={<AdminPrices />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
