import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FiStar, FiMapPin, FiShield, FiAward, FiArrowRight,
  FiArrowLeft, FiChevronRight, FiCheckCircle, FiThumbsUp, FiClock,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { format } from 'date-fns';
import api from '@/lib/axios.js';

function StarRating({ value = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar
          key={i}
          size={12}
          className={i < Math.round(value) ? 'text-amber-400 fill-current' : 'text-slate-200'}
        />
      ))}
    </div>
  );
}

export default function ProviderProfilePage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['provider', id],
    queryFn: () => api.get(`/providers/${id}/profile`).then((r) => r.data.data),
    enabled: !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['provider-reviews', id],
    queryFn: () => api.get(`/providers/${id}/reviews?limit=8`).then((r) => r.data.data),
    enabled: !!id,
  });

  const provider = data?.provider;
  const reviews = reviewsData?.reviews || [];

  if (isLoading) {
    return (
      <div className="container-app py-10 space-y-6">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="skeleton h-64 rounded-2xl" />
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const trustScore = provider?.trustScore || 82;
  const circumference = 2 * Math.PI * 50;
  const strokeDash = (trustScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-dark-900 border-b border-slate-100 dark:border-dark-700">
        <div className="container-app py-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <FiChevronRight size={12} />
          <Link to="/services" className="hover:text-primary-600">Services</Link>
          <FiChevronRight size={12} />
          <span className="text-slate-700 dark:text-slate-200 font-medium">{provider?.name}</span>
        </div>
      </div>

      <div className="container-app py-8">
        <Link to="/services" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors">
          <FiArrowLeft size={14} /> Back
        </Link>

        {/* Cover Banner */}
        <div className="relative h-40 rounded-2xl overflow-hidden bg-hero-gradient mb-16">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.4) 0%, transparent 60%)',
          }} />
          {/* Avatar */}
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-2xl ring-4 ring-white dark:ring-dark-900 overflow-hidden bg-white">
              <img
                src={provider?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider?.name || 'Provider')}&background=2563eb&color=fff&size=96`}
                alt={provider?.name}
                className="w-full h-full object-cover"
              />
            </div>
            {provider?.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                <FiCheckCircle className="text-white" size={14} />
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">
                    {provider?.name || 'Provider Name'}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
                    {provider?.bio || 'Professional home services provider'}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                    {provider?.city && (
                      <span className="flex items-center gap-1">
                        <FiMapPin size={12} /> {provider.city}
                      </span>
                    )}
                    {provider?.experience && (
                      <span className="flex items-center gap-1">
                        <FiClock size={12} /> {provider.experience} experience
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <FiCheckCircle size={12} className="text-emerald-500" />
                      {provider?.completedJobs || 0} jobs completed
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-center px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <p className="text-xl font-bold text-amber-600">
                      {provider?.rating?.toFixed(1) || '4.9'}
                    </p>
                    <StarRating value={provider?.rating || 4.9} />
                    <p className="text-xs text-slate-400 mt-1">{provider?.reviewCount || 0} reviews</p>
                  </div>
                </div>
              </div>

              {/* Categories/Skills */}
              {provider?.categories?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {provider.categories.map((cat) => (
                    <span key={cat} className="badge badge-blue text-xs">{cat}</span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Portfolio */}
            {provider?.portfolio?.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card p-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Portfolio</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {provider.portfolio.map((item, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-700">
                      <img src={item.url || item} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reviews */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Customer Reviews ({provider?.reviewCount || reviews.length})
                </h2>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <FiStar size={16} className="fill-current" />
                  <span className="font-bold text-slate-800 dark:text-white">
                    {provider?.rating?.toFixed(1) || '4.9'}
                  </span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b border-slate-100 dark:border-dark-700 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <img
                          src={review.customer?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.customer?.name || 'User')}&size=40&background=e2e8f0`}
                          alt={review.customer?.name}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-slate-800 dark:text-white text-sm">
                              {review.customer?.name || 'Anonymous'}
                            </p>
                            <p className="text-xs text-slate-400 flex-shrink-0">
                              {review.createdAt ? format(new Date(review.createdAt), 'MMM yyyy') : ''}
                            </p>
                          </div>
                          <StarRating value={review.rating} />
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{review.comment}</p>
                          {review.helpful > 0 && (
                            <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                              <FiThumbsUp size={10} /> {review.helpful} found helpful
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Book Now */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="card p-6 sticky top-24">
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium mb-4">
                <HiSparkles size={14} /> Top Rated Professional
              </div>

              <Link
                to={`/book?provider=${id}`}
                className="btn-primary w-full py-4 text-base mb-3"
              >
                Book {provider?.name?.split(' ')[0] || 'Provider'} <FiArrowRight size={16} />
              </Link>

              <div className="text-xs text-slate-500 text-center mb-5">
                Typically responds within 15 minutes
              </div>

              {/* Trust Score */}
              <div className="p-4 bg-slate-50 dark:bg-dark-800 rounded-xl mb-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3 text-center">Trust Score</p>
                <div className="flex items-center justify-center">
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 120 120" className="w-24 h-24 -rotate-90">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                      <circle
                        cx="60" cy="60" r="50" fill="none" stroke="#2563eb" strokeWidth="8"
                        strokeDasharray={`${strokeDash} ${circumference}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-slate-800 dark:text-white">{trustScore}</span>
                      <span className="text-xs text-slate-400">/100</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center text-slate-500 mt-2">
                  {trustScore >= 80 ? '🏆 Excellent' : trustScore >= 60 ? '👍 Good' : '⚠️ Average'}
                </p>
              </div>

              {/* Stats */}
              <div className="space-y-2">
                {[
                  { label: 'Jobs Completed', value: provider?.completedJobs || 0, icon: <FiCheckCircle className="text-emerald-500" size={14} /> },
                  { label: 'Response Rate', value: `${provider?.responseRate || 95}%`, icon: <FiThumbsUp className="text-blue-500" size={14} /> },
                  { label: 'Member Since', value: provider?.createdAt ? format(new Date(provider.createdAt), 'MMM yyyy') : 'N/A', icon: <FiAward className="text-purple-500" size={14} /> },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">{s.icon} {s.label}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{s.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <FiShield size={12} className="text-emerald-500" />
                Background verified by CareConnect AI
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
