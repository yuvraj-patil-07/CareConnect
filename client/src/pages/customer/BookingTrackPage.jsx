import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiMapPin, FiPhone, FiMessageSquare, FiStar, FiCheckCircle, FiClock, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '@/lib/axios.js';
import { format } from 'date-fns';

export default function BookingTrackPage() {
  const { id } = useParams();
  
  // In a real app we'd fetch the booking details and live location
  const [progress, setProgress] = useState(65);

  const steps = [
    { id: 1, title: 'Booking Confirmed', time: '10:00 AM', status: 'completed' },
    { id: 2, title: 'Provider Assigned', time: '10:15 AM', status: 'completed' },
    { id: 3, title: 'On the Way', time: '10:30 AM', status: 'active', desc: 'Provider is 15 mins away' },
    { id: 4, title: 'Service in Progress', time: '', status: 'pending' },
    { id: 5, title: 'Job Completed', time: '', status: 'pending' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Track Service</h1>
          <p className="text-slate-500 dark:text-slate-400">Booking #CC100294</p>
        </div>
        <div className="px-3 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-full text-sm font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
          Live Tracking
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map & Provider Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Simulated Map Container */}
          <div className="card overflow-hidden h-[400px] relative bg-slate-200 dark:bg-dark-800">
            {/* Map Placeholder Image/Background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-20"></div>
            
            {/* Route Line */}
            <div className="absolute top-1/2 left-1/4 right-1/4 h-1.5 bg-primary-200 dark:bg-primary-900/50 rounded-full -translate-y-1/2">
              <motion.div 
                className="h-full bg-primary-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </div>
            
            {/* Destination Pin */}
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-3 text-slate-800 dark:text-white">
              <FiMapPin size={28} className="fill-white dark:fill-dark-900" />
            </div>

            {/* Moving Car/Provider Pin */}
            <motion.div 
              className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-primary-600 rounded-full border-4 border-white dark:border-dark-900 shadow-lg flex items-center justify-center text-white z-10"
              initial={{ left: '25%' }}
              animate={{ left: `calc(25% + (${progress}% * 0.5))` }}
              transition={{ duration: 2, ease: "easeOut" }}
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </motion.div>

            {/* ETA Overlay */}
            <div className="absolute bottom-4 left-4 right-4 md:right-auto bg-white/90 dark:bg-dark-900/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-200 dark:border-dark-700">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Estimated Arrival</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-slate-900 dark:text-white">15</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">mins</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                <FiClock size={14} /> 10:45 AM
              </p>
            </div>
          </div>

          {/* Provider Card */}
          <div className="card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative">
                <img src="https://i.pravatar.cc/150?img=11" alt="Provider" className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-white dark:border-dark-800" />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-dark-800">
                  <FiShield size={10} />
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Rahul Sharma</h3>
                <p className="text-slate-500 text-sm">Expert Plumber • 4.9 <FiStar className="inline text-amber-500 -mt-1" /> (120+ jobs)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link to="/chat" className="flex-1 md:flex-none btn-outline flex justify-center items-center gap-2">
                <FiMessageSquare /> Chat
              </Link>
              <button className="flex-1 md:flex-none btn-primary flex justify-center items-center gap-2">
                <FiPhone /> Call
              </button>
            </div>
          </div>
        </div>

        {/* Timeline & Details */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-6">Service Timeline</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:ml-[1.125rem] before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary-500 before:via-slate-200 before:to-transparent dark:before:via-dark-700">
              {steps.map((step, idx) => (
                <div key={step.id} className="relative flex items-start gap-4 group">
                  <div className={`
                    w-8 h-8 md:w-9 md:h-9 flex items-center justify-center shrink-0 rounded-full border-2 bg-white dark:bg-dark-900 z-10 transition-colors
                    ${step.status === 'completed' ? 'border-primary-500 text-primary-500' 
                      : step.status === 'active' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                      : 'border-slate-300 dark:border-dark-700 text-slate-300 dark:text-dark-700'}
                  `}>
                    {step.status === 'completed' ? <FiCheckCircle size={18} /> : <div className={`w-2.5 h-2.5 rounded-full ${step.status === 'active' ? 'bg-primary-500 animate-pulse' : 'bg-slate-300 dark:bg-dark-700'}`} />}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold ${step.status === 'pending' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-white'}`}>
                        {step.title}
                      </h4>
                      {step.time && <span className="text-xs text-slate-500 font-medium">{step.time}</span>}
                    </div>
                    {step.desc && (
                      <p className="text-sm text-primary-600 dark:text-primary-400 mt-1 font-medium">{step.desc}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30">
            <h4 className="font-semibold text-slate-800 dark:text-white mb-2">OTP Verification</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Share this code with the provider before they start the work.</p>
            <div className="flex gap-2 justify-center">
              {[8, 2, 4, 9].map((num, i) => (
                <div key={i} className="w-12 h-14 bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-800 dark:text-white shadow-sm">
                  {num}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
