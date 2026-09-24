import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiSend, FiCheckCircle } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '@/lib/axios.js';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, getValues } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email: data.email });
      setSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-hero-gradient p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3) 0%, transparent 40%)',
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
              Forgot your<br />password?
            </h2>
            <p className="text-white/70 text-lg">
              No worries — we'll send you a secure reset link to your inbox.
            </p>
          </motion.div>
        </div>
        <div className="relative z-10 text-white/50 text-sm">
          © 2025 CareConnect AI. Secure & Encrypted.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-dark-950">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
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

          {!sent ? (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-5">
                  <FiMail className="text-primary-600" size={24} />
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
                  Reset Password
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Enter your registered email and we'll send you a password reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className={`input pl-11 ${errors.email ? 'input-error' : ''}`}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                      })}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 text-base"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending link…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FiSend size={16} /> Send Reset Link
                    </span>
                  )}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle className="text-emerald-500" size={36} />
              </div>
              <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">
                Check your inbox!
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                We've sent a reset link to:
              </p>
              <p className="font-semibold text-primary-600 text-lg mb-6">{getValues('email')}</p>
              <p className="text-sm text-slate-400 mb-8">
                The link will expire in 15 minutes. Check your spam folder if you don't see it.
              </p>
              <button
                onClick={() => setSent(false)}
                className="btn-secondary w-full"
              >
                Try a different email
              </button>
            </motion.div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors"
            >
              <FiArrowLeft size={14} /> Back to Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
