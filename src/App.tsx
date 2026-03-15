import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useEffect } from 'react';
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
import ScheduledPurchases from './pages/ScheduledPurchases';
import DeveloperAPI from './pages/DeveloperAPI';
import Profile from './pages/Profile';
import Upgrade from './pages/Upgrade';
import ResellerDashboard from './pages/ResellerDashboard';
import PersonalInfo from './pages/profile/PersonalInfo';
import PasswordSettings from './pages/profile/PasswordSettings';
import ApiWebhookSettings from './pages/profile/ApiWebhookSettings';
import NotificationSettings from './pages/profile/NotificationSettings';
import AppDownload from './pages/profile/AppDownload';
import Crypto from './pages/Crypto';
import P2PTransfer from './pages/P2PTransfer';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Pricing from './pages/Pricing';
import ApiDocsLayout from './pages/docs/ApiDocsLayout';
import ApiDocsOverview from './pages/docs/ApiDocsOverview';
import ApiDocsAuth from './pages/docs/ApiDocsAuth';
import AirtimeApi from './pages/docs/AirtimeApi';
import DataApi from './pages/docs/DataApi';
import CableApi from './pages/docs/CableApi';
import ElectricityApi from './pages/docs/ElectricityApi';
import EducationApi from './pages/docs/EducationApi';
import SmmApi from './pages/docs/SmmApi';
import CryptoApi from './pages/docs/CryptoApi';
import ServicesApi from './pages/docs/ServicesApi';
import ApiSandbox from './pages/docs/ApiSandbox';
import AllServices from './pages/AllServices';
import QuickPurchase from './pages/QuickPurchase';
import ProfileSetupModal from './components/ProfileSetupModal';
import ErrorBoundary from './components/ErrorBoundary';
import { useInactivityLogout } from './hooks/useInactivityLogout';

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

function AppRoutes() {
  useInactivityLogout();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Save last path
  useEffect(() => {
    const publicPaths = ['/login', '/signup', '/', '/about', '/terms', '/privacy', '/contact', '/blog', '/pricing'];
    if (!publicPaths.includes(location.pathname) && !location.pathname.startsWith('/blog/')) {
      localStorage.setItem('lastPath', location.pathname);
    }
  }, [location]);

  // Restore last path on mount if at root and authenticated
  useEffect(() => {
    if (!loading && user && window.location.pathname === '/') {
      const lastPath = localStorage.getItem('lastPath');
      if (lastPath && lastPath !== '/') {
        navigate(lastPath);
      } else {
        navigate('/dashboard');
      }
    }
  }, [loading, user]);

  // Redirect from auth pages if logged in
  useEffect(() => {
    if (!loading && user && (location.pathname === '/login' || location.pathname === '/signup')) {
      navigate('/dashboard');
    }
  }, [loading, user, location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/about" element={<About />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:id" element={<BlogPost />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/quick-purchase" element={<QuickPurchase />} />
      
      <Route path="/developer/docs" element={<ApiDocsLayout />}>
        <Route index element={<ApiDocsOverview />} />
        <Route path="auth" element={<ApiDocsAuth />} />
        <Route path="services" element={<ServicesApi />} />
        <Route path="airtime" element={<AirtimeApi />} />
        <Route path="data" element={<DataApi />} />
        <Route path="cable" element={<CableApi />} />
        <Route path="electricity" element={<ElectricityApi />} />
        <Route path="education" element={<EducationApi />} />
        <Route path="smm" element={<SmmApi />} />
        <Route path="crypto" element={<CryptoApi />} />
        <Route path="sandbox" element={<ApiSandbox />} />
      </Route>
      
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
        <Route path="/crypto" element={<Crypto />} />
        <Route path="/history" element={<History />} />
        <Route path="/scheduled-purchases" element={<ScheduledPurchases />} />
        <Route path="/developer" element={<DeveloperAPI />} />
        <Route path="/services" element={<AllServices />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="/reseller-dashboard" element={<ResellerDashboard />} />
        <Route path="/profile/personal-info" element={<PersonalInfo />} />
        <Route path="/profile/password" element={<PasswordSettings />} />
        <Route path="/profile/api-webhook" element={<ApiWebhookSettings />} />
        <Route path="/profile/notifications" element={<NotificationSettings />} />
        <Route path="/profile/download-app" element={<AppDownload />} />
        <Route path="/dashboard/terms" element={<Terms />} />
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
  );
}

function AppContent() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
