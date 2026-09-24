import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiCalendar, FiPlus, FiArrowRight, FiStar, FiZap, FiAward } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import api from '@/lib/axios.js';
import { format } from 'date-fns';

const statusColors = {
  pending: 'badge-orange', accepted: 'badge-blue', completed: 'badge-green',
  cancelled: 'badge-red', disputed: 'bg-yellow-100 text-yellow-700',
  provider_enroute: 'badge-blue', started: 'badge-purple',
};

const statCards = [
  { label: 'Total Bookings', key: 'totalBookings', icon: <FiCalendar />, color: 'bg-blue-500', lightBg: 'bg-blue-50', textColor: 'text-blue-700' },
  { label: 'Active Bookings', key: 'activeBookings', icon: <FiZap />, color: 'bg-emerald-500', lightBg: 'bg-emerald-50', textColor: 'text-emerald-700' },
  { label: 'Wallet Balance', key: 'wallet', icon: '💰', color: 'bg-purple-500', lightBg: 'bg-purple-50', textColor: 'text-purple-700', prefix: '₹' },
  { label: 'CC Points', key: 'coins', icon: '⭐', color: 'bg-amber-500', lightBg: 'bg-amber-50', textColor: 'text-amber-700', suffix: ' pts' },
];

export default function CustomerDashboard() {
  const { user } = useSelector((s) => s.auth);

  const { data: bookingsData } = useQuery({
    queryKey: ['bookings', 'recent'],
    queryFn: () => api.get('/bookings?limit=5&sort=-createdAt').then((r) => r.data.data),
  });

  const { data: statsData } = useQuery({
    queryKey: ['bookings', 'stats'],
    queryFn: () => api.get('/bookings/stats').then((r) => r.data.data),
  });

  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => api.get('/notifications?limit=5').then((r) => r.data.data),
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const activeCount = bookingsData?.bookings?.filter((b) =>
    ['pending', 'accepted', 'confirmed', 'provider_assigned', 'provider_enroute', 'started'].includes(b.status)
  ).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">
            {greeting}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            What can we fix for you today?
          </p>
        </div>
        <Link to="/book" className="btn-primary gap-2 hidden sm:flex">
          <FiPlus size={16} /> Book a Service
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: statsData?.stats?.length || 0, icon: <FiCalendar size={20} />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Active', value: activeCount, icon: <FiZap size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Wallet', value: `₹${user?.wallet?.balance || 0}`, icon: '💰', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'CC Points', value: `${user?.wallet?.coins || 0} pts`, icon: '⭐', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-5"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}>
              {typeof stat.icon === 'string' ? <span className="text-lg">{stat.icon}</span> : stat.icon}
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white font-display">{stat.value}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Book */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-2xl bg-hero-gradient p-6 md:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
            <HiSparkles className="text-emerald-400" /> AI-Powered Booking
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
            What needs fixing today?
          </h2>
          <p className="text-white/70 mb-5">Describe in any language — AI will handle the rest.</p>
          <Link to="/book" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-lg">
            <FiPlus size={16} /> Book a Service Now
          </Link>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-800 dark:text-white text-lg">Recent Bookings</h2>
            <Link to="/bookings" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View all <FiArrowRight size={14} />
            </Link>
          </div>

          {bookingsData?.bookings?.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FiCalendar size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No bookings yet</p>
              <p className="text-sm mt-1">Book your first service and we'll take care of the rest!</p>
              <Link to="/book" className="btn-primary mt-4 inline-flex">Book Now</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookingsData?.bookings?.map((booking, i) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/bookings/${booking._id}`}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 border border-slate-100 dark:border-dark-700 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 flex-shrink-0">
                        <FiCalendar size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 dark:text-white text-sm truncate">
                          {booking.description?.substring(0, 50) || 'Service Booking'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          #{booking.bookingNumber} • {booking.scheduledDate ? format(new Date(booking.scheduledDate), 'dd MMM, hh:mm a') : 'Not scheduled'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                      <span className={`badge ${statusColors[booking.status] || 'badge-gray'} capitalize text-xs`}>
                        {booking.status?.replace('_', ' ')}
                      </span>
                      {booking.totalAmount && (
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          ₹{booking.totalAmount}
                        </span>
                      )}
                      <FiArrowRight size={14} className="text-slate-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Subscription Card */}
          {user?.subscription?.plan === 'free' && (
            <div className="card p-5 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-100 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <FiAward className="text-purple-600" size={18} />
                <span className="font-semibold text-slate-800 dark:text-white text-sm">Upgrade to Care Plus</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">Get 2 free inspections, priority booking, and 10% off all services.</p>
              <Link to="/subscription" className="btn-primary text-xs py-2 px-4">
                <FiZap size={12} /> Upgrade Now
              </Link>
            </div>
          )}

          {/* Home Health Score */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-slate-800 dark:text-white text-sm">Home Health Score</span>
              <HiSparkles className="text-primary-500" size={16} />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2563eb" strokeWidth="3"
                    strokeDasharray={`${(user?.homeHealthScore?.score || 72)} 100`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-800 dark:text-white">{user?.homeHealthScore?.score || 72}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Good</p>
                <p className="text-xs text-slate-500">3 items need attention</p>
                <Link to="/home-health" className="text-xs text-primary-600 hover:underline mt-1 block">View report →</Link>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">Recent Notifications</h3>
            {notifData?.notifications?.slice(0, 3).map((n) => (
              <div key={n._id} className={`flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-dark-700 last:border-0 ${!n.isRead ? 'opacity-100' : 'opacity-60'}`}>
                <div className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0" style={{ background: !n.isRead ? '#2563eb' : '#e2e8f0' }} />
                <div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{n.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{n.message?.substring(0, 60)}…</p>
                </div>
              </div>
            )) || <p className="text-xs text-slate-400">No notifications</p>}
            <Link to="/notifications" className="text-xs text-primary-600 hover:underline mt-2 block">View all →</Link>
          </div>
        </div>
      </div>

      {/* Mobile Book FAB */}
      <Link
        to="/book"
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl shadow-glow-blue flex items-center justify-center z-40 transition-transform active:scale-95"
      >
        <FiPlus size={24} />
      </Link>
    </div>
  );
}
