import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { HiSparkles } from 'react-icons/hi2';
import { loginUser } from '@/store/slices/authSlice.js';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
    if (result.meta.requestStatus === 'fulfilled') {
      const user = result.payload.user;
      if (user.role === 'provider') navigate('/provider/dashboard');
      else if (['admin', 'operations_manager', 'support_agent'].includes(user.role)) navigate('/admin');
      else navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-hero-gradient p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.1) 0%, transparent 40%)',
        }} />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <HiSparkles className="text-white" size={18} />
            </div>
            <span className="font-display font-bold text-xl text-white">CareConnect AI</span>
          </Link>
        </div>
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-4xl font-display font-bold text-white mb-4">
              Welcome back to smarter<br />home services.
            </h2>
            <p className="text-white/70 text-lg mb-8">
              AI-powered, verified professionals, real-time tracking.
            </p>
            {[
              '✅ AI-ranked verified professionals',
              '✅ Real-time booking tracking',
              '✅ Secure payments & wallet',
              '✅ 24/7 AI-powered support',
            ].map((item) => (
              <div key={item} className="text-white/80 text-sm mb-2">{item}</div>
            ))}
          </motion.div>
        </div>
        <div className="relative z-10 text-white/50 text-sm">
          © 2025 CareConnect AI. Trusted by 50,000+ customers.
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-dark-950">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
                <HiSparkles className="text-white text-sm" />
              </div>
              <span className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Care<span className="text-primary-600">Connect</span>
                <span className="text-emerald-500 text-sm">AI</span>
              </span>
            </Link>
          </div>

          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
            Sign in
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">
              Create one free →
            </Link>
          </p>

          {/* Google */}
          <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 dark:border-dark-600 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors mb-6 font-medium text-slate-700 dark:text-slate-200">
            <FcGoogle size={20} /> Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-dark-700" />
            <span className="text-xs text-slate-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-dark-700" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={`input pl-11 ${errors.email ? 'input-error' : ''}`}
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input pl-11 pr-11 ${errors.password ? 'input-error' : ''}`}
                  {...register('password', { required: 'Password is required' })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-base">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">Sign in <FiArrowRight size={16} /></span>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-xs text-primary-700 dark:text-primary-300">
            <p className="font-semibold mb-1">🔑 Demo Credentials</p>
            <p>Customer: <span className="font-mono">aditya.verma@example.com / Customer@123</span></p>
            <p>Provider: <span className="font-mono">rahul.sharma@example.com / Provider@123</span></p>
            <p>Admin: <span className="font-mono">admin@careconnect.ai / Admin@123456</span></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
