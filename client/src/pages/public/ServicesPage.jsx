import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiSearch, FiGrid, FiList, FiStar, FiChevronRight, FiFilter, FiX } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import api from '@/lib/axios.js';

const CATEGORIES = ['All', 'Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 'AC Repair', 'Pest Control', 'Shifting'];

export default function ServicesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['services', search, category, sortBy],
    queryFn: () =>
      api.get('/services', {
        params: {
          search: search || undefined,
          category: category !== 'All' ? category : undefined,
          sort: sortBy,
          limit: 30,
        },
      }).then((r) => r.data.data),
    keepPreviousData: true,
  });

  const services = data?.services || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950">
      {/* Hero Banner */}
      <div className="bg-hero-gradient py-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 50%)',
        }} />
        <div className="container-app relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 text-white text-xs font-medium rounded-full mb-4">
              <HiSparkles size={12} /> AI-Powered Matching
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              All Services
            </h1>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Browse 100+ home services. Book vetted professionals with one click.
            </p>

            {/* Search bar */}
            <div className="max-w-lg mx-auto relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services — e.g. 'leaking pipe', 'deep clean'…"
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-slate-800 border-0 shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-app py-8">
        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-dark-600 hover:border-primary-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isLoading ? 'Loading…' : `${services.length} services found`}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary py-2 px-3 text-sm gap-1.5"
            >
              <FiFilter size={14} /> Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-slate-200 dark:border-dark-600 rounded-xl px-3 py-2 bg-white dark:bg-dark-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <div className="flex gap-1 bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-600 rounded-xl p-1">
              <button
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <FiGrid size={14} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <FiList size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className={`grid gap-5 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-5 space-y-3">
                <div className="skeleton h-36 rounded-xl" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-8 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Services Grid */}
        {!isLoading && services.length > 0 && (
          <div className={`grid gap-5 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {services.map((service, i) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <Link to={`/services/${service._id}`} className="card block overflow-hidden group">
                  {/* Image */}
                  <div className="relative h-40 bg-gradient-to-br from-primary-100 to-emerald-100 dark:from-primary-900/30 dark:to-emerald-900/20 overflow-hidden">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        {service.icon || '🔧'}
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="badge badge-blue text-xs">{service.category}</span>
                    </div>
                    {service.isPopular && (
                      <div className="absolute top-3 right-3">
                        <span className="badge bg-orange-500 text-white text-xs">Popular</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 dark:text-white text-base mb-1 group-hover:text-primary-600 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          <FiStar size={12} className="fill-current" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {service.avgRating?.toFixed(1) || '4.8'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">({service.reviewCount || '200+'})</span>
                      </div>
                      <div className="text-right">
                        {service.basePrice ? (
                          <p className="text-sm font-bold text-slate-800 dark:text-white">
                            ₹{service.basePrice}
                            <span className="text-xs font-normal text-slate-400 ml-0.5">onwards</span>
                          </p>
                        ) : (
                          <p className="text-xs text-primary-600 font-medium">Get Quote</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-dark-700 flex items-center justify-between">
                      <span className="text-xs text-emerald-600 font-medium">
                        ✓ {service.providerCount || '50'}+ providers
                      </span>
                      <span className="text-primary-600 text-xs font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                        Book Now <FiChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && services.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">No services found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Try a different search term or category.</p>
            <button
              onClick={() => { setSearch(''); setCategory('All'); }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
