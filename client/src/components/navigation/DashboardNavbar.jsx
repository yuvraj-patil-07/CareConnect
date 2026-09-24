import { useDispatch, useSelector } from 'react-redux';
import { FiMenu, FiBell, FiMoon, FiSun, FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { setMobileSidebar, toggleDarkMode } from '@/store/slices/uiSlice.js';

export default function DashboardNavbar({ isAdmin = false }) {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((s) => s.ui);
  const { unreadCount } = useSelector((s) => s.notifications);
  const { user } = useSelector((s) => s.auth);

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-dark-700 px-4 md:px-6 lg:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile hamburger */}
        <button
          onClick={() => dispatch(setMobileSidebar(true))}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-800"
        >
          <FiMenu size={20} />
        </button>

        {/* Search bar */}
        <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-dark-800 rounded-xl">
          <FiSearch size={16} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search services, bookings..."
            className="bg-transparent text-sm text-slate-600 dark:text-slate-300 placeholder-slate-400 outline-none w-full"
          />
          <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-slate-400 bg-slate-200 dark:bg-dark-700 rounded font-mono">⌘K</kbd>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {/* Dark mode */}
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
          >
            {darkMode ? <FiSun size={17} /> : <FiMoon size={17} />}
          </button>

          {/* Notifications */}
          <Link
            to={isAdmin ? '#' : '/notifications'}
            className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
          >
            <FiBell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            )}
          </Link>

          {/* Avatar */}
          <Link to={isAdmin ? '/admin' : '/profile'} className="ml-1">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt={user.name} className="w-8 h-8 avatar border-2 border-primary-200" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
