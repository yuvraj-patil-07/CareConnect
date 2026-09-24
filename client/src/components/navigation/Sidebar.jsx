import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiCalendar, FiUser, FiMessageSquare, FiCreditCard,
  FiBell, FiHeart, FiAward, FiTool, FiBarChart2, FiFileText,
  FiClock, FiLogOut, FiX, FiPackage,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { setMobileSidebar } from '@/store/slices/uiSlice.js';
import { logoutUser } from '@/store/slices/authSlice.js';
import clsx from 'clsx';

const customerLinks = [
  { icon: <FiHome size={18} />, label: 'Dashboard', to: '/dashboard' },
  { icon: <FiCalendar size={18} />, label: 'Bookings', to: '/bookings' },
  { icon: <FiMessageSquare size={18} />, label: 'Messages', to: '/chat' },
  { icon: <FiCreditCard size={18} />, label: 'Wallet', to: '/wallet' },
  { icon: <FiBell size={18} />, label: 'Notifications', to: '/notifications' },
  { icon: <FiHeart size={18} />, label: 'Home Health AI', to: '/home-health' },
  { icon: <FiAward size={18} />, label: 'Subscription', to: '/subscription' },
  { icon: <FiUser size={18} />, label: 'Profile', to: '/profile' },
];

const providerLinks = [
  { icon: <FiHome size={18} />, label: 'Dashboard', to: '/provider/dashboard' },
  { icon: <FiPackage size={18} />, label: 'Bookings', to: '/provider/bookings' },
  { icon: <FiBarChart2 size={18} />, label: 'Analytics', to: '/provider/analytics' },
  { icon: <FiMessageSquare size={18} />, label: 'Messages', to: '/provider/chat' },
  { icon: <FiCreditCard size={18} />, label: 'Wallet', to: '/provider/wallet' },
  { icon: <FiClock size={18} />, label: 'Availability', to: '/provider/availability' },
  { icon: <FiFileText size={18} />, label: 'Documents', to: '/provider/documents' },
  { icon: <FiUser size={18} />, label: 'Profile', to: '/provider/profile' },
];

export default function Sidebar({ role }) {
  const { mobileSidebarOpen } = useSelector((s) => s.ui);
  const { user } = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const links = role === 'provider' ? providerLinks : customerLinks;

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-200 dark:border-dark-700">
        <div className="w-8 h-8 rounded-xl bg-hero-gradient flex items-center justify-center">
          <HiSparkles className="text-white text-sm" />
        </div>
        <span className="font-display font-bold text-lg text-slate-900 dark:text-white">
          Care<span className="text-primary-600">Connect</span>
          <span className="text-emerald-500 text-xs font-semibold ml-0.5">AI</span>
        </span>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-slate-100 dark:border-dark-700">
        <div className="flex items-center gap-3">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt={user.name} className="w-10 h-10 avatar border-2 border-primary-200" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              clsx('sidebar-link', isActive && 'active')
            }
            onClick={() => dispatch(setMobileSidebar(false))}
          >
            {link.icon}
            <span className="text-sm">{link.label}</span>
            {link.label === 'Notifications' && unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-100 dark:border-dark-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm transition-colors"
        >
          <FiLogOut size={17} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-dark-700 fixed top-0 left-0 h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="lg:hidden fixed top-0 left-0 h-full w-64 bg-white dark:bg-dark-900 z-30 shadow-2xl"
          >
            <button
              onClick={() => dispatch(setMobileSidebar(false))}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800"
            >
              <FiX size={18} className="text-slate-500" />
            </button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
