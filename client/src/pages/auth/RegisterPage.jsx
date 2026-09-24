import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { HiSparkles } from 'react-icons/hi2';
import { registerUser } from '@/store/slices/authSlice.js';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('customer');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((s) => s.auth);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await dispatch(registerUser({ ...data, role }));
    if (result.meta.requestStatus === 'fulfilled') {
      if (role === 'provider') navigate('/provider/dashboard');
      else navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-emerald-800 via-emerald-700 to-primary-800 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
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
          <h2 className="text-4xl font-display font-bold text-white mb-4">
            Join India's #1 AI Home Services Platform
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Sign up in 60 seconds. No credit card required.
          </p>
          {[
            { icon: '🤖', text: 'AI-powered service matching' },
            { icon: '✅', text: 'Verified & background-checked providers' },
            { icon: '💰', text: 'Transparent pricing, no hidden charges' },
            { icon: '📍', text: 'Real-time live tracking' },
            { icon: '🎁', text: '50% off your first booking with WELCOME50' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-white/80 text-sm mb-3">
              <span>{item.icon}</span><span>{item.text}</span>
            </div>
          ))}
        </div>
        <p className="relative z-10 text-white/40 text-xs">© 2025 CareConnect AI. Built for India.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-dark-950 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md py-8"
        >
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Create account</h1>
          <p className="text-slate-500 mb-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in →</Link>
          </p>

          {/* Role Toggle */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-dark-800 p-1 mb-6">
            {['customer', 'provider'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                  role === r ? 'bg-white dark:bg-dark-700 shadow text-primary-700 dark:text-primary-400' : 'text-slate-500'
                }`}
              >
                {r === 'customer' ? '🏠 I need services' : '🔧 I provide services'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type="text" placeholder="Aditya Verma" className={`input pl-10 ${errors.name ? 'input-error' : ''}`}
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 chars' } })} />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type="email" placeholder="you@example.com" className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone number</label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type="tel" placeholder="98XXXXXXXX" className={`input pl-10 ${errors.phone ? 'input-error' : ''}`}
                  {...register('phone', { required: 'Phone is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid Indian phone number' } })} />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type={showPassword ? 'text' : 'password'} placeholder="Min. 8 chars with number & uppercase"
                  className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Min 8 characters' },
                    pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must have uppercase, lowercase & number' },
                  })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.
            </p>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-base">
              {isLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  Create Free Account <FiArrowRight />
                </span>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-slate-200 dark:bg-dark-700" />
            <span className="text-xs text-slate-400">OR</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-dark-700" />
          </div>

          <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 dark:border-dark-600 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors font-medium text-slate-700 dark:text-slate-200 text-sm">
            <FcGoogle size={18} /> Sign up with Google
          </button>
        </motion.div>
      </div>
    </div>
  );
}
