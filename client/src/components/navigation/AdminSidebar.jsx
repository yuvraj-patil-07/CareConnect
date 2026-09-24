import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '@/store/slices/authSlice.js';
import { HiSparkles } from 'react-icons/hi2';
import {
  FiHome, FiUsers, FiCalendar, FiGrid, FiAlertCircle,
  FiTag, FiBarChart2, FiShield, FiLogOut,
} from 'react-icons/fi';
import clsx from 'clsx';

const adminLinks = [
  { icon: <FiHome size={18} />, label: 'Dashboard', to: '/admin' },
  { icon: <FiUsers size={18} />, label: 'Users', to: '/admin/users' },
  { icon: <FiShield size={18} />, label: 'Providers', to: '/admin/providers' },
  { icon: <FiCalendar size={18} />, label: 'Bookings', to: '/admin/bookings' },
  { icon: <FiGrid size={18} />, label: 'Categories', to: '/admin/categories' },
  { icon: <FiAlertCircle size={18} />, label: 'Disputes', to: '/admin/disputes' },
  { icon: <FiTag size={18} />, label: 'Coupons', to: '/admin/coupons' },
  { icon: <FiBarChart2 size={18} />, label: 'Analytics', to: '/admin/analytics' },
];

export default function AdminSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-dark-900 border-r border-dark-700 fixed top-0 left-0 h-full z-30">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-dark-700">
        <div className="w-8 h-8 rounded-xl bg-hero-gradient flex items-center justify-center">
          <HiSparkles className="text-white text-sm" />
        </div>
        <span className="font-display font-bold text-lg text-white">
          Care<span className="text-primary-400">Connect</span>
          <span className="text-xs text-emerald-400 font-semibold ml-0.5">Admin</span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {adminLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-400 hover:bg-dark-700 hover:text-slate-100'
              )
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-dark-700">
        <button
          onClick={() => { dispatch(logoutUser()); navigate('/'); }}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-900/20 font-medium text-sm"
        >
          <FiLogOut size={17} /> Logout
        </button>
      </div>
    </aside>
  );
}
