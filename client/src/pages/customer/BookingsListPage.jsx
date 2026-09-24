import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiSearch, FiFilter, FiArrowRight, FiChevronLeft,
  FiChevronRight, FiX, FiPlus,
} from 'react-icons/fi';
import { format } from 'date-fns';
import api from '@/lib/axios.js';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS = {
  pending: 'badge-orange',
  accepted: 'badge-blue',
  confirmed: 'badge-blue',
  provider_assigned: 'badge-blue',
  provider_enroute: 'badge-blue',
  started: 'badge-purple',
  completed: 'badge-green',
  cancelled: 'badge-red',
  disputed: 'bg-yellow-100 text-yellow-700',
};

const PAGE_SIZE = 10;

export default function BookingsListPage() {
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', status, search, page],
    queryFn: () =>
      api.get('/bookings', {
        params: {
          status: status !== 'all' ? status : undefined,
          search: search || undefined,
          page,
          limit: PAGE_SIZE,
          sort: '-createdAt',
        },
      }).then((r) => r.data.data),
    keepPreviousData: true,
  });

  const bookings = data?.bookings || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const handleStatusChange = (s) => {
    setStatus(s);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">
            My Bookings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {total > 0 ? `${total} bookings total` : 'Manage all your service bookings'}
          </p>
        </div>
        <Link to="/book" className="btn-primary gap-2 hidden sm:flex">
          <FiPlus size={16} /> New Booking
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by booking ID, service…"
            className="input pl-10"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <FiX size={14} />
            </button>
          )}
        </div>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="input w-auto min-w-[160px]"
        >
          {STATUS_TABS.map((t) => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Status Tab Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleStatusChange(tab.key)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              status === tab.key
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-dark-600 hover:border-primary-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-5 flex items-center gap-4">
              <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-3 w-1/2" />
              </div>
              <div className="skeleton h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Bookings List */}
      {!isLoading && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((booking, i) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={`/bookings/${booking._id}`}
                className="card p-5 flex items-center gap-4 group hover:shadow-card-hover transition-all"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 flex-shrink-0">
                  <FiCalendar size={20} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">
                      #{booking.bookingNumber}
                    </p>
                    <span className={`badge ${STATUS_COLORS[booking.status] || 'badge-gray'} capitalize text-xs`}>
                      {booking.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 truncate mt-0.5">
                    {booking.service?.name || booking.description?.substring(0, 60) || 'Service Booking'}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>
                      {booking.scheduledDate
                        ? format(new Date(booking.scheduledDate), 'dd MMM yyyy, hh:mm a')
                        : `Booked ${format(new Date(booking.createdAt), 'dd MMM yyyy')}`}
                    </span>
                    {booking.provider && (
                      <span>· {booking.provider.name}</span>
                    )}
                  </div>
                </div>

                {/* Amount + Arrow */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {booking.totalAmount && (
                    <span className="text-base font-bold text-slate-800 dark:text-white">
                      ₹{booking.totalAmount}
                    </span>
                  )}
                  <FiArrowRight
                    size={16}
                    className="text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && bookings.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-12 text-center"
        >
          <div className="w-20 h-20 bg-slate-100 dark:bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FiCalendar size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">No bookings found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            {search || status !== 'all'
              ? 'Try clearing your filters.'
              : "You haven't made any bookings yet."}
          </p>
          {status !== 'all' || search ? (
            <button
              onClick={() => { setStatus('all'); setSearch(''); setPage(1); }}
              className="btn-secondary"
            >
              <FiX size={14} /> Clear Filters
            </button>
          ) : (
            <Link to="/book" className="btn-primary">
              <FiPlus size={16} /> Book Your First Service
            </Link>
          )}
        </motion.div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary py-2 px-3 disabled:opacity-40"
            >
              <FiChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary py-2 px-3 disabled:opacity-40"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile FAB */}
      <Link
        to="/book"
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl shadow-lg flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <FiPlus size={24} />
      </Link>
    </div>
  );
}
