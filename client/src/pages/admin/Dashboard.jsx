import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FiTrendingUp, FiUsers, FiCalendar, FiDollarSign, FiStar, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/axios.js';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get('/admin/dashboard').then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const stats = data?.stats || {};
  const monthlyRevenue = data?.monthlyRevenue || [];
  const recentBookings = data?.recentBookings || [];

  const kpiCards = [
    { label: 'Total Customers', value: stats.totalUsers?.toLocaleString() || '—', icon: <FiUsers size={22} />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', trend: '+12%' },
    { label: 'Total Providers', value: stats.totalProviders?.toLocaleString() || '—', icon: <FiStar size={22} />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', trend: '+8%' },
    { label: 'Total Bookings', value: stats.totalBookings?.toLocaleString() || '—', icon: <FiCalendar size={22} />, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', trend: '+23%' },
    { label: 'Platform Revenue', value: `₹${(data?.revenue || 0).toLocaleString()}`, icon: <FiDollarSign size={22} />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', trend: '+18%' },
    { label: "Today's Bookings", value: stats.todayBookings?.toLocaleString() || '—', icon: <FiTrendingUp size={22} />, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20', trend: '+5%' },
    { label: 'Pending Verifications', value: stats.pendingVerifications?.toLocaleString() || '—', icon: <FiAlertCircle size={22} />, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', urgent: true },
  ];

  const revenueData = monthlyRevenue.map((m) => ({
    name: `${m._id.month}/${m._id.year % 100}`,
    revenue: m.revenue,
    bookings: m.bookings,
  }));

  const statusData = [
    { name: 'Completed', value: 65 },
    { name: 'Pending', value: 15 },
    { name: 'Active', value: 12 },
    { name: 'Cancelled', value: 8 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Platform overview and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`card p-5 ${card.urgent ? 'border-red-200 dark:border-red-800' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
              {card.trend && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {card.trend}
                </span>
              )}
              {card.urgent && stats.pendingVerifications > 0 && (
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full animate-pulse">
                  Action needed
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white font-display">{card.value}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-800 dark:text-white">Platform Revenue</h2>
            <span className="badge badge-blue text-xs">Monthly</span>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(v, n) => [n === 'revenue' ? `₹${v}` : v, n === 'revenue' ? 'Revenue' : 'Bookings']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-slate-400">
              <p>Generating revenue data…</p>
            </div>
          )}
        </div>

        {/* Status Pie */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-5">Booking Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-800 dark:text-white">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-100 dark:border-dark-700">
                {['Booking #', 'Customer', 'Service', 'City', 'Status', 'Amount'].map((h) => (
                  <th key={h} className="text-left pb-3 font-medium pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
              {recentBookings.map((b) => (
                <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-slate-500">#{b.bookingNumber}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0">
                        {b.customer?.name?.charAt(0) || '?'}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-white truncate max-w-24">{b.customer?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{b.service?.name || '—'}</td>
                  <td className="py-3 pr-4 text-slate-500">{b.serviceLocation?.city || '—'}</td>
                  <td className="py-3 pr-4">
                    <span className={`badge capitalize text-xs ${
                      b.status === 'completed' ? 'badge-green' :
                      b.status === 'cancelled' ? 'badge-red' :
                      b.status === 'pending' ? 'badge-orange' : 'badge-blue'
                    }`}>
                      {b.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-slate-800 dark:text-white">
                    {b.totalAmount ? `₹${b.totalAmount}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!recentBookings.length && (
            <p className="text-center py-8 text-slate-400 text-sm">No bookings yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
