import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '@/lib/axios.js';

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid or missing reset token. Please request a new link.');
      return;
    }
    try {
      setLoading(true);
      await api.post('/auth/reset-password', { token, newPassword: data.password });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (pwd = '') => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(password || '');
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'][strength];

  return (
    <div className="min-h-screen flex">
      {/* Left Branding */}
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
        <motion.div className="relative z-10" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-4xl font-display font-bold text-white mb-4">
            Set a new<br />secure password.
          </h2>
          <p className="text-white/70 text-lg">Use at least 8 characters with a mix of letters, numbers, and symbols.</p>
        </motion.div>
        <div className="relative z-10 text-white/50 text-sm">© 2025 CareConnect AI.</div>
      </div>

      {/* Right Form */}
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

          {!success ? (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-5">
                  <FiLock className="text-primary-600" size={24} />
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
                  New Password
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Choose a strong password you haven't used before.
                </p>
              </div>

              {!token && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                  ⚠️ Invalid or missing reset token. Please request a new reset link.
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`input pl-11 pr-11 ${errors.password ? 'input-error' : ''}`}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Minimum 8 characters' },
                        pattern: {
                          value: /^(?=.*[A-Za-z])(?=.*\d)/,
                          message: 'Must contain letters and numbers',
                        },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}

                  {/* Strength meter */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-slate-200 dark:bg-dark-600'}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">{strengthLabel} password</p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`input pl-11 pr-11 ${errors.confirmPassword ? 'input-error' : ''}`}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (val) => val === password || 'Passwords do not match',
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="btn-primary w-full py-3.5 text-base"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting…
                    </span>
                  ) : (
                    'Reset Password'
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
                Password Reset!
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Your password has been updated. Redirecting to login…
              </p>
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
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
