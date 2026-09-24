import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiMoon, FiSun, FiBell, FiUser, FiLogOut, FiSettings, FiHome } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { toggleDarkMode } from '@/store/slices/uiSlice.js';
import { logoutUser } from '@/store/slices/authSlice.js';
import { useSelector as useReduxSelector } from 'react-redux';

const navLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Providers', href: '/providers' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'About', href: '/#about' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const darkMode = useSelector((s) => s.ui.darkMode);
  const notifications = useSelector((s) => s.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'provider') return '/provider/dashboard';
    if (['admin', 'operations_manager', 'support_agent'].includes(user.role)) return '/admin';
    return '/dashboard';
  };

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl shadow-lg border-b border-slate-200/60 dark:border-dark-700/60'
          : 'bg-transparent'
      }`}
    >
      <div className="container-app">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-hero-gradient flex items-center justify-center shadow-glow-blue group-hover:shadow-glow-emerald transition-shadow">
              <HiSparkles className="text-white text-sm" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Care<span className="text-primary-600">Connect</span>
              <span className="text-emerald-500 text-sm font-semibold ml-0.5">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150 ${
                  location.pathname === link.href
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-dark-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Dark Mode */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <Link to="/notifications" className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors">
                  <FiBell size={18} />
                  {notifications.unreadCount > 0 && (
                    <span className="notification-dot" />
                  )}
                </Link>

                {/* Profile */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                  >
                    {user.avatar?.url ? (
                      <img src={user.avatar.url} alt={user.name} className="w-7 h-7 avatar" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">
                      {user.name?.split(' ')[0]}
                    </span>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-slate-100 dark:border-dark-700 py-2 z-50"
                        onMouseLeave={() => setProfileOpen(false)}
                      >
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-dark-700">
                          <p className="font-semibold text-slate-800 dark:text-white text-sm">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                        {[
                          { icon: <FiHome size={15} />, label: 'Dashboard', to: getDashboardLink() },
                          { icon: <FiUser size={15} />, label: 'Profile', to: '/profile' },
                          { icon: <FiSettings size={15} />, label: 'Settings', to: '/profile?tab=settings' },
                        ].map((item) => (
                          <Link key={item.label} to={item.to} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors" onClick={() => setProfileOpen(false)}>
                            <span className="text-slate-400">{item.icon}</span>{item.label}
                          </Link>
                        ))}
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <FiLogOut size={15} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Log in</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-dark-900 border-t border-slate-200 dark:border-dark-700"
          >
            <div className="container-app py-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href} className="flex items-center px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 font-medium">
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="pt-3 flex gap-2">
                  <Link to="/login" className="btn-secondary flex-1 text-center text-sm">Log in</Link>
                  <Link to="/register" className="btn-primary flex-1 text-center text-sm">Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
