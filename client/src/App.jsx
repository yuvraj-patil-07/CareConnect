import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';

// Layouts
import PublicLayout from '@/layouts/PublicLayout.jsx';
import DashboardLayout from '@/layouts/DashboardLayout.jsx';
import AdminLayout from '@/layouts/AdminLayout.jsx';

// Public Pages
import LandingPage from '@/pages/public/LandingPage.jsx';
import LoginPage from '@/pages/auth/LoginPage.jsx';
import RegisterPage from '@/pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage.jsx';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage.jsx';
import ServicesPage from '@/pages/public/ServicesPage.jsx';
import ServiceDetailPage from '@/pages/public/ServiceDetailPage.jsx';
import ProviderProfilePage from '@/pages/public/ProviderProfilePage.jsx';

// Customer Pages
import CustomerDashboard from '@/pages/customer/Dashboard.jsx';
import BookingPage from '@/pages/customer/BookingPage.jsx';
import BookingsListPage from '@/pages/customer/BookingsListPage.jsx';
import BookingDetailPage from '@/pages/customer/BookingDetailPage.jsx';
import BookingTrackPage from '@/pages/customer/BookingTrackPage.jsx';
import ProfilePage from '@/pages/customer/ProfilePage.jsx';
import WalletPage from '@/pages/customer/WalletPage.jsx';
import ChatPage from '@/pages/customer/ChatPage.jsx';
import NotificationsPage from '@/pages/customer/NotificationsPage.jsx';
import HomeHealthPage from '@/pages/customer/HomeHealthPage.jsx';
import SubscriptionPage from '@/pages/customer/SubscriptionPage.jsx';

// Provider Pages
import ProviderDashboard from '@/pages/provider/Dashboard.jsx';
import ProviderBookings from '@/pages/provider/Bookings.jsx';
import ProviderProfile from '@/pages/provider/Profile.jsx';
import ProviderAvailability from '@/pages/provider/Availability.jsx';
import ProviderAnalytics from '@/pages/provider/Analytics.jsx';
import ProviderDocuments from '@/pages/provider/Documents.jsx';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard.jsx';
import AdminUsers from '@/pages/admin/Users.jsx';
import AdminProviders from '@/pages/admin/Providers.jsx';
import AdminBookings from '@/pages/admin/Bookings.jsx';
import AdminCategories from '@/pages/admin/Categories.jsx';
import AdminDisputes from '@/pages/admin/Disputes.jsx';
import AdminCoupons from '@/pages/admin/Coupons.jsx';
import AdminAnalytics from '@/pages/admin/Analytics.jsx';

// Utility
import NotFoundPage from '@/pages/utility/NotFoundPage.jsx';
import UnauthorizedPage from '@/pages/utility/UnauthorizedPage.jsx';
import OfflinePage from '@/pages/utility/OfflinePage.jsx';

// Guards
import ProtectedRoute from '@/components/guards/ProtectedRoute.jsx';

export default function App() {
  const { user, accessToken } = useSelector((s) => s.auth);

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          {/* ── Public ─────────────────────────────────────────────────────── */}
          <Route element={<PublicLayout />}>
            <Route path="/"                    element={<LandingPage />} />
            <Route path="/services"            element={<ServicesPage />} />
            <Route path="/services/:id"        element={<ServiceDetailPage />} />
            <Route path="/providers/:id"       element={<ProviderProfilePage />} />
            <Route path="/login"               element={(user && accessToken) ? <Navigate to="/dashboard" /> : <LoginPage />} />
            <Route path="/register"            element={(user && accessToken) ? <Navigate to="/dashboard" /> : <RegisterPage />} />
            <Route path="/forgot-password"     element={<ForgotPasswordPage />} />
            <Route path="/reset-password"      element={<ResetPasswordPage />} />
            <Route path="/verify-email"        element={<VerifyEmailPage />} />
          </Route>

          {/* ── Customer ───────────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute roles={['customer']} />}>
            <Route element={<DashboardLayout role="customer" />}>
              <Route path="/dashboard"             element={<CustomerDashboard />} />
              <Route path="/book"                  element={<BookingPage />} />
              <Route path="/bookings"              element={<BookingsListPage />} />
              <Route path="/bookings/:id"          element={<BookingDetailPage />} />
              <Route path="/bookings/:id/track"    element={<BookingTrackPage />} />
              <Route path="/profile"               element={<ProfilePage />} />
              <Route path="/wallet"                element={<WalletPage />} />
              <Route path="/chat"                  element={<ChatPage />} />
              <Route path="/chat/:chatId"          element={<ChatPage />} />
              <Route path="/notifications"         element={<NotificationsPage />} />
              <Route path="/home-health"           element={<HomeHealthPage />} />
              <Route path="/subscription"          element={<SubscriptionPage />} />
            </Route>
          </Route>

          {/* ── Provider ───────────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute roles={['provider']} />}>
            <Route element={<DashboardLayout role="provider" />}>
              <Route path="/provider/dashboard"    element={<ProviderDashboard />} />
              <Route path="/provider/bookings"     element={<ProviderBookings />} />
              <Route path="/provider/profile"      element={<ProviderProfile />} />
              <Route path="/provider/availability" element={<ProviderAvailability />} />
              <Route path="/provider/analytics"    element={<ProviderAnalytics />} />
              <Route path="/provider/documents"    element={<ProviderDocuments />} />
              <Route path="/provider/chat"         element={<ChatPage />} />
              <Route path="/provider/wallet"       element={<WalletPage />} />
            </Route>
          </Route>

          {/* ── Admin ──────────────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute roles={['admin', 'operations_manager', 'support_agent']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin"               element={<AdminDashboard />} />
              <Route path="/admin/users"         element={<AdminUsers />} />
              <Route path="/admin/providers"     element={<AdminProviders />} />
              <Route path="/admin/bookings"      element={<AdminBookings />} />
              <Route path="/admin/categories"    element={<AdminCategories />} />
              <Route path="/admin/disputes"      element={<AdminDisputes />} />
              <Route path="/admin/coupons"       element={<AdminCoupons />} />
              <Route path="/admin/analytics"     element={<AdminAnalytics />} />
            </Route>
          </Route>

          {/* ── Utility ────────────────────────────────────────────────────── */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/offline"      element={<OfflinePage />} />
          <Route path="*"             element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
