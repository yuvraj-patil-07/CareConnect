import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiClock, FiDollarSign, FiStar, FiTrendingUp,
  FiCheckCircle, FiPackage, FiArrowRight, FiZap,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useSelector } from 'react-redux';
import api from '@/lib/axios.js';
import { format } from 'date-fns';

const statusColors = {
  pending: 'badge-orange', accepted: 'badge-blue', completed: 'badge-green',
  cancelled: 'badge-red', started: 'badge-purple',
};

export default function ProviderDashboard() {
  const { user, provider } = useSelector((s) => s.auth);

  const { data: analyticsData } = useQuery({
    queryKey: ['provider', 'analytics'],
    queryFn: () => api.get('/providers/me/analytics').then((r) => r.data.data),
  });

  const { data: bookingsData } = useQuery({
    queryKey: ['provider', 'bookings', 'recent'],
    queryFn: () => api.get('/bookings?limit=5&sort=-createdAt').then((r) => r.data.data),
  });

  const { data: availableData } = useQuery({
    queryKey: ['provider', 'bookings', 'available'],
    queryFn: () => api.get('/bookings/available?limit=3').then((r) => r.data.data),
  });

  const monthlyData = analyticsData?.monthly?.map((m) => ({
    name: `${m._id.month}/${m._id.year % 100}`,
    earnings: m.revenue,
    jobs: m.jobs,
  })) || [];

  const stats = analyticsData?.stats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, {user?.name?.split(' ')[0]}! Here's your overview.
          </p>
        </div>
        <Link to="/provider/bookings" className="btn-primary gap-2 hidden sm:flex">
          <FiPackage size={16} /> View Jobs
        </Link>
      </div>

      {/* Trust Score Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
              <HiSparkles className="text-emerald-400" /> AI Trust Score
            </div>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-display font-bold text-white">
                {analyticsData?.trustScore || provider?.trustScore || 85}
              </span>
              <span className="text-white/60 text-sm pb-2">/100</span>
            </div>
            <p className="text-white/70 text-sm mt-1">
              {(analyticsData?.trustScore || 85) >= 90 ? '🏆 Super Pro status — Top 5% providers' :
               (analyticsData?.trustScore || 85) >= 80 ? '⭐ Excellent — Keep it up!' :
               '📈 Good — Complete more jobs to improve'}
            </p>
          </div>
          <div className="relative w-28 h-28 hidden sm:block">
            <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#34d399" strokeWidth="3"
                strokeDasharray={`${analyticsData?.trustScore || 85} 100`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiStar className="text-yellow-300" size={28} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earnings', value: `₹${(stats.totalEarnings || 0).toLocaleString()}`, icon: <FiDollarSign size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'This Month', value: `₹${(stats.thisMonthEarnings || 0).toLocaleString()}`, icon: <FiTrendingUp size={20} />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Completed Jobs', value: stats.completedJobs || 0, icon: <FiCheckCircle size={20} />, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Avg Response', value: `${stats.avgResponseTime || 12}min`, icon: <FiClock size={20} />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-5"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white font-display">{stat.value}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-800 dark:text-white">Monthly Earnings</h2>
            <span className="badge badge-green text-xs">Last 6 months</span>
          </div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip formatter={(v) => [`₹${v}`, 'Earnings']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="earnings" stroke="#2563eb" strokeWidth={2} fill="url(#earningsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400">
              <p>Complete your first job to see earnings data</p>
            </div>
          )}
        </div>

        {/* Available Jobs */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 dark:text-white text-sm">New Requests Near You</h2>
            <FiZap className="text-amber-500" size={16} />
          </div>
          {availableData?.bookings?.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FiPackage size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No new requests near you</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableData?.bookings?.map((job) => (
                <Link key={job._id} to={`/provider/bookings`}
                  className="block p-3 rounded-xl border border-slate-100 dark:border-dark-700 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                    {job.description?.substring(0, 45)}…
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-slate-500">{job.serviceLocation?.city}</span>
                    <span className="text-xs font-semibold text-emerald-600">₹{job.aiAnalysis?.estimatedCostMin}–{job.aiAnalysis?.estimatedCostMax}</span>
                  </div>
                </Link>
              ))}
              <Link to="/provider/bookings" className="text-xs text-primary-600 hover:underline block text-center">
                View all available →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-800 dark:text-white">Recent Jobs</h2>
          <Link to="/provider/bookings" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            View all <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-100 dark:border-dark-700">
                <th className="text-left pb-3 font-medium">Booking</th>
                <th className="text-left pb-3 font-medium hidden md:table-cell">Date</th>
                <th className="text-left pb-3 font-medium">Status</th>
                <th className="text-right pb-3 font-medium">Earning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
              {bookingsData?.bookings?.map((job) => (
                <tr key={job._id} className="hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors">
                  <td className="py-3">
                    <Link to={`/bookings/${job._id}`} className="font-medium text-slate-800 dark:text-white hover:text-primary-600">
                      #{job.bookingNumber}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">{job.description?.substring(0, 30)}…</p>
                  </td>
                  <td className="py-3 hidden md:table-cell text-slate-500">
                    {job.scheduledDate ? format(new Date(job.scheduledDate), 'dd MMM') : '—'}
                  </td>
                  <td className="py-3">
                    <span className={`badge ${statusColors[job.status] || 'badge-gray'} capitalize text-xs`}>
                      {job.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-right font-semibold text-emerald-600">
                    {job.providerEarning ? `₹${job.providerEarning}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!bookingsData?.bookings?.length && (
            <p className="text-center py-8 text-slate-400 text-sm">No jobs yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
