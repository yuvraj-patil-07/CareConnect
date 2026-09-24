import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import {
  FiSearch, FiStar, FiZap, FiShield, FiClock, FiArrowRight,
  FiCheckCircle, FiAward, FiMic, FiCamera, FiMessageCircle,
  FiTrendingUp, FiHeart, FiGlobe, FiChevronDown,
} from 'react-icons/fi';
import { HiSparkles, HiOutlineLightBulb, HiOutlineHome } from 'react-icons/hi2';
import { BsRobot, BsShieldCheck, BsLightningCharge } from 'react-icons/bs';
import { MdElectricBolt } from 'react-icons/md';

// ─── Data ─────────────────────────────────────────────────────────────────────

const categories = [
  { name: 'AC Service', icon: '❄️', color: '#3B82F6', gradient: 'from-blue-500 to-blue-700', count: '2,400+', popular: true },
  { name: 'Cleaning', icon: '🧹', color: '#10B981', gradient: 'from-emerald-500 to-emerald-700', count: '3,100+' },
  { name: 'Plumbing', icon: '🔧', color: '#6366F1', gradient: 'from-indigo-500 to-indigo-700', count: '1,800+' },
  { name: 'Electrical', icon: '⚡', color: '#F59E0B', gradient: 'from-amber-500 to-amber-700', count: '2,200+', popular: true },
  { name: 'Painting', icon: '🎨', color: '#EC4899', gradient: 'from-pink-500 to-pink-700', count: '1,200+' },
  { name: 'Carpentry', icon: '🪚', color: '#8B5CF6', gradient: 'from-purple-500 to-purple-700', count: '900+' },
  { name: 'Pest Control', icon: '🛡️', color: '#EF4444', gradient: 'from-red-500 to-red-700', count: '800+' },
  { name: 'Interior', icon: '🛋️', color: '#06B6D4', gradient: 'from-cyan-500 to-cyan-700', count: '600+' },
];

const stats = [
  { value: 50000, suffix: '+', label: 'Bookings Completed', icon: <FiCheckCircle /> },
  { value: 10000, suffix: '+', label: 'Verified Providers', icon: <FiShield /> },
  { value: 4.9, suffix: '★', label: 'Average Rating', decimals: 1, icon: <FiStar /> },
  { value: 200, suffix: '+', label: 'Service Categories', icon: <FiGrid /> },
];

const aiFeatures = [
  {
    icon: <BsRobot size={28} />,
    title: 'AI Smart Booking',
    description: 'Describe your issue in plain language. Our AI understands and finds the perfect provider instantly.',
    color: 'from-blue-500/20 to-indigo-500/20',
    accent: '#3B82F6',
    badge: 'GPT-4o Powered',
  },
  {
    icon: <HiOutlineLightBulb size={28} />,
    title: 'Home Health Report',
    description: 'Get AI-generated preventive maintenance schedules based on your home\'s service history.',
    color: 'from-emerald-500/20 to-teal-500/20',
    accent: '#10B981',
    badge: 'Exclusive Feature',
  },
  {
    icon: <BsShieldCheck size={28} />,
    title: 'Trust Score',
    description: 'Every provider has an AI-calculated Trust Score based on 15+ verification parameters.',
    color: 'from-purple-500/20 to-violet-500/20',
    accent: '#8B5CF6',
    badge: 'AI Verified',
  },
  {
    icon: <BsLightningCharge size={28} />,
    title: 'Emergency Dispatch',
    description: 'AI detects urgency and auto-dispatches the nearest available provider in under 5 minutes.',
    color: 'from-orange-500/20 to-red-500/20',
    accent: '#F97316',
    badge: '< 5 min response',
  },
  {
    icon: <FiMic size={28} />,
    title: 'Voice Booking',
    description: 'Book services hands-free using natural voice commands in Hindi, English, or any regional language.',
    color: 'from-pink-500/20 to-rose-500/20',
    accent: '#EC4899',
    badge: 'Multilingual',
  },
  {
    icon: <FiCamera size={28} />,
    title: 'AR Troubleshooting',
    description: 'Point your camera at a problem. AI diagnoses the issue and recommends the right service.',
    color: 'from-cyan-500/20 to-sky-500/20',
    accent: '#06B6D4',
    badge: 'Computer Vision',
  },
];

const reviews = [
  { name: 'Aditya Verma', city: 'Mumbai', rating: 5, text: 'CareConnect AI is phenomenal! The AI diagnosed my AC problem just from a voice description. Provider arrived in 45 minutes. Unbelievable service!', avatar: 'AV', service: 'AC Repair' },
  { name: 'Neha Gupta', city: 'Delhi', rating: 5, text: 'The Home Health Report predicted my geyser would fail — I got it serviced and it saved me from a breakdown in winter. This AI is genuinely useful!', avatar: 'NG', service: 'Geyser Service' },
  { name: 'Vikram Malhotra', city: 'Bangalore', rating: 5, text: 'Booked a deep cleaning through voice command in Hindi. The cleaning team was spotless professionals. 10/10 would recommend!', avatar: 'VM', service: 'Deep Cleaning' },
  { name: 'Sneha Rao', city: 'Hyderabad', rating: 5, text: 'The Trust Score feature gave me so much confidence. My electrician had a 94 Trust Score — he was incredibly professional.', avatar: 'SR', service: 'Electrical' },
  { name: 'Arjun Kapoor', city: 'Pune', rating: 5, text: 'Used the emergency dispatch at midnight for a pipe burst. Provider was at my door in 12 minutes. Absolutely saved my house!', avatar: 'AK', service: 'Emergency Plumbing' },
];

const howItWorks = [
  { step: '01', title: 'Describe Your Need', desc: 'Type, speak, or take a photo. Our AI understands exactly what you need.', icon: <FiMessageCircle size={22} /> },
  { step: '02', title: 'AI Matches Providers', desc: 'Get AI-ranked, verified providers with transparent pricing within seconds.', icon: <HiSparkles size={22} /> },
  { step: '03', title: 'Book Instantly', desc: 'Accept a quote, schedule, pay securely — all in one seamless flow.', icon: <FiZap size={22} /> },
  { step: '04', title: 'Real-Time Tracking', desc: 'Track your provider on a live map and chat with them directly.', icon: <FiTrendingUp size={22} /> },
];

// ─── Animation Variants ────────────────────────────────────────────────────────

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Utility ──────────────────────────────────────────────────────────────────

function FiGrid(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function HeroSection() {
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  const suggestions = ['AC not cooling?', 'Need a deep cleaning', 'Bathroom pipe leaking', 'Paint my bedroom', 'Pest control treatment'];
  const [currentSuggestion, setCurrentSuggestion] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % suggestions.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/services?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900" />
      
      {/* Animated orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-900/30 rounded-full blur-3xl" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      <div className="relative z-10 container-app text-center pt-24 pb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm font-medium mb-8"
        >
          <HiSparkles className="text-emerald-400" size={16} />
          Powered by GPT-4o Vision • Trusted by 50,000+ customers
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight"
        >
          The Smartest Way to<br />
          <span className="gradient-text">Fix Your Home</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto"
        >
          AI-powered home services marketplace. Describe your problem, get instant quotes
          from verified professionals, and track them in real-time.
        </motion.p>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleSearch}
          className={`relative max-w-2xl mx-auto mb-6 transition-all duration-300 ${searchFocused ? 'scale-102' : ''}`}
        >
          <div className={`flex items-center bg-white dark:bg-dark-800 rounded-2xl shadow-2xl overflow-hidden border-2 transition-colors duration-200 ${searchFocused ? 'border-primary-400' : 'border-transparent'}`}>
            <div className="flex items-center gap-3 pl-5 pr-3 flex-1 min-w-0">
              <FiSearch size={20} className="text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0 py-4">
                {!query && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm md:text-base pointer-events-none absolute">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={currentSuggestion}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        {suggestions[currentSuggestion]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full outline-none text-slate-800 dark:text-white bg-transparent text-sm md:text-base"
                  aria-label="Search services"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pr-3">
              <button type="button" className="p-2 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Voice search">
                <FiMic size={18} />
              </button>
              <button type="button" className="p-2 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Photo search">
                <FiCamera size={18} />
              </button>
              <button type="submit" className="btn-primary py-2.5 px-6 rounded-xl text-sm whitespace-nowrap">
                <HiSparkles size={15} /> Search with AI
              </button>
            </div>
          </div>
        </motion.form>

        {/* Quick tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-14"
        >
          <span className="text-slate-400 text-sm">Popular:</span>
          {['AC Service', 'Deep Cleaning', 'Plumbing', 'Electrician', 'Painting'].map((tag) => (
            <button
              key={tag}
              onClick={() => navigate(`/services?q=${encodeURIComponent(tag)}`)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 text-sm rounded-xl border border-white/15 transition-colors"
            >
              {tag}
            </button>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {[
            { value: '50K+', label: 'Bookings Done' },
            { value: '10K+', label: 'Pro Providers' },
            { value: '4.9★', label: 'Avg Rating' },
            { value: '<15min', label: 'Response Time' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-white font-display">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center mt-16"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-slate-500 cursor-pointer"
            onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <FiChevronDown size={28} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const navigate = useNavigate();

  return (
    <section id="categories" className="section-padding bg-white dark:bg-dark-950">
      <div className="container-app" ref={ref}>
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="text-center mb-14"
        >
          <motion.div variants={fadeUpVariant}>
            <span className="badge badge-blue mb-4">200+ Services</span>
            <h2 className="section-title">What Do You Need Fixed?</h2>
            <p className="section-subtitle mx-auto">
              From emergency repairs to scheduled maintenance — we have verified professionals for every home service need.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat.name}
              variants={fadeUpVariant}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/services?category=${cat.name}`)}
              className="relative group p-6 bg-white dark:bg-dark-800 rounded-2xl border border-slate-100 dark:border-dark-700 shadow-card hover:shadow-card-hover transition-all duration-200 text-left"
            >
              {cat.popular && (
                <span className="absolute top-3 right-3 badge badge-orange text-xs">Popular</span>
              )}
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}
              >
                {cat.icon}
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">{cat.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{cat.count} bookings</p>
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-10"
        >
          <Link to="/services" className="btn-secondary">
            Browse All 200+ Services <FiArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function AIFeaturesSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="section-padding bg-slate-50 dark:bg-dark-900">
      <div className="container-app" ref={ref}>
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="text-center mb-14"
        >
          <motion.div variants={fadeUpVariant}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-400 text-sm font-semibold mb-5">
              <HiSparkles /> AI-Powered Platform
            </div>
            <h2 className="section-title">Not Just a Booking App</h2>
            <p className="section-subtitle mx-auto">
              CareConnect AI uses cutting-edge artificial intelligence to give you a smarter, safer, and faster home services experience.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {aiFeatures.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUpVariant}
              whileHover={{ y: -4 }}
              className="group relative p-6 bg-white dark:bg-dark-800 rounded-2xl border border-slate-100 dark:border-dark-700 shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden"
            >
              {/* Gradient bg */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${feature.accent}, ${feature.accent}cc)` }}
                  >
                    {feature.icon}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: feature.accent + '22', color: feature.accent }}>
                    {feature.badge}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="section-padding bg-white dark:bg-dark-950">
      <div className="container-app" ref={ref}>
        <motion.div className="text-center mb-14" initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={staggerContainer}>
          <motion.div variants={fadeUpVariant}>
            <h2 className="section-title">How CareConnect Works</h2>
            <p className="section-subtitle mx-auto">
              From problem to solution in minutes — not hours.
            </p>
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" />

          {howItWorks.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="text-center relative"
            >
              <div className="relative inline-flex">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-glow-blue mb-6">
                  {step.icon}
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-dark-800 rounded-full border-2 border-primary-500 flex items-center justify-center text-xs font-bold text-primary-600">
                    {i + 1}
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    const timer = setInterval(() => setActive((p) => (p + 1) % reviews.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="section-padding bg-slate-50 dark:bg-dark-900">
      <div className="container-app" ref={ref}>
        <motion.div className="text-center mb-14" initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={staggerContainer}>
          <motion.div variants={fadeUpVariant}>
            <h2 className="section-title">Loved by 50,000+ Customers</h2>
            <p className="section-subtitle mx-auto">Real experiences from real people across India.</p>
          </motion.div>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="card p-8 text-center"
            >
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: reviews[active].rating }).map((_, i) => (
                  <FiStar key={i} className="star-filled" size={20} />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed mb-6 italic">
                "{reviews[active].text}"
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                  {reviews[active].avatar}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800 dark:text-white">{reviews[active].name}</p>
                  <p className="text-sm text-slate-500">{reviews[active].city} • {reviews[active].service}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-2 mt-6">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${i === active ? 'bg-primary-600 w-6' : 'bg-slate-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const [ref, inView] = useInView({ triggerOnce: true });
  return (
    <section className="section-padding bg-hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      <div className="container-app relative z-10 text-center" ref={ref}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 rounded-full text-white text-sm font-medium mb-6">
            <FiZap className="text-yellow-300" /> Limited time: 50% off your first booking
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Ready to Experience the Future<br />of Home Services?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Join 50,000+ smart homeowners. Book in 60 seconds, track in real-time, pay securely.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-2xl hover:bg-slate-50 transition-colors text-lg shadow-xl">
              <HiSparkles /> Get Started Free
            </Link>
            <Link to="/services" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 hover:bg-white/25 text-white font-bold rounded-2xl border border-white/30 transition-colors text-lg">
              Browse Services <FiArrowRight />
            </Link>
          </div>
          <p className="text-white/50 text-sm mt-6">No credit card required • Free cancellation • 24/7 support</p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <CategoriesSection />
      <AIFeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
