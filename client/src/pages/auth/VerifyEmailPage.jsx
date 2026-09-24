import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiMail, FiArrowRight } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import api from '@/lib/axios.js';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please check your email link.');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(res.data?.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err?.response?.data?.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <HiSparkles className="text-white" size={20} />
            </div>
            <span className="font-display font-bold text-2xl text-slate-900 dark:text-white">
              Care<span className="text-primary-600">Connect</span>
              <span className="text-emerald-500 text-sm ml-0.5">AI</span>
            </span>
          </Link>
        </div>

        <div className="card p-8 text-center">
          {/* Loading */}
          {status === 'loading' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiMail className="text-primary-500" size={32} />
              </div>
              <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">
                Verifying your email…
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Please wait while we verify your email address.
              </p>
              <div className="flex justify-center">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2.5 h-2.5 bg-primary-500 rounded-full"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Success */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <motion.div
                className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                animate={{ scale: [0.8, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                <FiCheckCircle className="text-emerald-500" size={36} />
              </motion.div>
              <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">
                Email Verified! 🎉
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-2">{message}</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">
                Your account is now active. You can sign in and start booking services.
              </p>

              <div className="space-y-3">
                <Link to="/login" className="btn-primary w-full py-3.5">
                  <FiArrowRight size={16} /> Sign in to your account
                </Link>
                <Link to="/" className="btn-secondary w-full">
                  Go to Homepage
                </Link>
              </div>

              {/* Confetti dots */}
              <div className="mt-8 flex justify-center gap-2">
                {['bg-primary-400', 'bg-emerald-400', 'bg-orange-400', 'bg-purple-400'].map((c, i) => (
                  <motion.div
                    key={i}
                    className={`w-2 h-2 rounded-full ${c}`}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 1, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Error */}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiXCircle className="text-red-500" size={36} />
              </div>
              <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">
                Verification Failed
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-2">{message}</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">
                Verification links expire after 24 hours. Please request a new one if needed.
              </p>

              <div className="space-y-3">
                <Link to="/login" className="btn-primary w-full py-3.5">
                  Back to Login
                </Link>
                <p className="text-xs text-slate-400">
                  Need help?{' '}
                  <a href="mailto:support@careconnect.ai" className="text-primary-600 hover:underline">
                    Contact support
                  </a>
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
