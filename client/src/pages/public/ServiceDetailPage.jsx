import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FiStar, FiClock, FiMapPin, FiShield, FiArrowRight,
  FiCheckCircle, FiChevronRight, FiUser, FiArrowLeft,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import api from '@/lib/axios.js';

export default function ServiceDetailPage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: () => api.get(`/services/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });

  const { data: providersData } = useQuery({
    queryKey: ['service-providers', id],
    queryFn: () => api.get(`/services/${id}/providers?limit=6`).then((r) => r.data.data),
    enabled: !!id,
  });

  const service = data?.service;
  const providers = providersData?.providers || [];

  if (isLoading) {
    return (
      <div className="container-app py-10 space-y-6">
        <div className="skeleton h-72 rounded-2xl" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-8 w-2/3" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
          </div>
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!service && !isLoading) {
    return (
      <div className="container-app py-24 text-center">
        <div className="text-6xl mb-4">🔧</div>
        <h2 className="text-2xl font-bold text-slate-700 dark:text-white mb-2">Service Not Found</h2>
        <Link to="/services" className="btn-primary mt-4">Browse All Services</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-dark-900 border-b border-slate-100 dark:border-dark-700">
        <div className="container-app py-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <FiChevronRight size={12} />
          <Link to="/services" className="hover:text-primary-600">Services</Link>
          <FiChevronRight size={12} />
          <span className="text-slate-700 dark:text-slate-200 font-medium">{service?.name}</span>
        </div>
      </div>

      <div className="container-app py-8">
        {/* Back button */}
        <Link to="/services" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors">
          <FiArrowLeft size={14} /> Back to Services
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative h-72 md:h-80 rounded-2xl overflow-hidden"
            >
              {service?.image ? (
                <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-emerald-100 dark:from-primary-900/30 dark:to-emerald-900/20 flex items-center justify-center text-8xl">
                  {service?.icon || '🔧'}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <span className="badge badge-blue mb-2">{service?.category}</span>
                <h1 className="text-3xl font-display font-bold">{service?.name}</h1>
              </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-5 flex flex-wrap gap-6"
            >
              {[
                { icon: <FiStar className="text-amber-400 fill-current" />, label: 'Rating', value: `${service?.avgRating?.toFixed(1) || '4.8'} / 5` },
                { icon: <FiUser className="text-primary-500" />, label: 'Providers', value: `${service?.providerCount || '50'}+` },
                { icon: <FiClock className="text-emerald-500" />, label: 'Avg Duration', value: service?.avgDuration || '1-2 hrs' },
                { icon: <FiShield className="text-blue-500" />, label: 'Warranty', value: service?.warranty || '30 Days' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-50 dark:bg-dark-700 rounded-xl flex items-center justify-center">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="card p-6"
            >
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">About this Service</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {service?.description || 'Professional and reliable service by vetted experts. Our providers are background-verified, trained, and rated by thousands of customers.'}
              </p>
            </motion.div>

            {/* What's Included */}
            {service?.includes?.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
              >
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">What's Included</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {service.includes.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <FiCheckCircle className="text-emerald-500 flex-shrink-0 mt-0.5" size={14} />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Top Providers */}
            {providers.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="card p-6"
              >
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                  Top Providers for this Service
                </h2>
                <div className="space-y-3">
                  {providers.map((provider) => (
                    <Link
                      key={provider._id}
                      to={`/providers/${provider._id}`}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors group"
                    >
                      <img
                        src={provider.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=2563eb&color=fff`}
                        alt={provider.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 dark:text-white truncate">{provider.name}</p>
                        <p className="text-xs text-slate-500">{provider.completedJobs || 0} jobs · {provider.experience || '2+ yrs'}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        <FiStar size={14} className="fill-current" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {provider.rating?.toFixed(1) || '4.9'}
                        </span>
                      </div>
                      <FiArrowRight size={14} className="text-slate-400 group-hover:text-primary-600 transition-colors" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 sticky top-24"
            >
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium mb-4">
                <HiSparkles size={14} /> AI-Matched Professionals
              </div>

              <div className="mb-4">
                {service?.basePrice ? (
                  <>
                    <p className="text-xs text-slate-400 mb-0.5">Starting from</p>
                    <p className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                      ₹{service.basePrice}
                    </p>
                  </>
                ) : (
                  <p className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                    Pricing based on assessment
                  </p>
                )}
              </div>

              {service?.pricingTiers?.length > 0 && (
                <div className="space-y-2 mb-5 p-3 bg-slate-50 dark:bg-dark-800 rounded-xl">
                  {service.pricingTiers.map((tier, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{tier.name}</span>
                      <span className="font-semibold text-slate-800 dark:text-white">₹{tier.price}</span>
                    </div>
                  ))}
                </div>
              )}

              <Link
                to={`/book?service=${id}`}
                className="btn-primary w-full py-4 text-base mb-3"
              >
                Book Now <FiArrowRight size={16} />
              </Link>

              <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                {[
                  '✅ Free cancellation up to 2 hours before',
                  '🔒 Secure payment — Pay after service',
                  '⭐ Satisfaction guarantee or money back',
                  '📍 Providers within 10 km radius',
                ].map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-700">
                <div className="flex items-center gap-2">
                  <FiMapPin size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Available in 50+ cities across India
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
