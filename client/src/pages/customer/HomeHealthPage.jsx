import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiActivity, FiShield, FiAlertTriangle, FiCheckCircle, FiTool, FiZap, FiDroplet, FiWind, FiPlay } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios.js';

export default function HomeHealthPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Simulated AI Health Data
  const healthScore = 78;
  
  const recommendations = [
    { id: 1, type: 'critical', icon: <FiDroplet />, title: 'Water Heater Maintenance Due', desc: 'Your AC & Water Heater are running inefficiently based on recent seasonal usage patterns. We recommend a descaling service.', cost: '₹499', service: 'Plumbing' },
    { id: 2, type: 'warning', icon: <FiZap />, title: 'High AC Power Consumption', desc: 'Your last 2 AC services were 9 months ago. Dust buildup is likely causing a 15% increase in electricity bills.', cost: '₹899', service: 'AC Repair' },
    { id: 3, type: 'info', icon: <FiWind />, title: 'Air Quality Check', desc: 'Post-monsoon humidity often leads to mold in ducts. Consider deep cleaning.', cost: '₹1200', service: 'Cleaning' }
  ];

  const systems = [
    { name: 'Electrical', status: 'healthy', score: 95 },
    { name: 'Plumbing', status: 'warning', score: 65 },
    { name: 'HVAC', status: 'warning', score: 55 },
    { name: 'Appliances', status: 'healthy', score: 88 },
  ];

  const runScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsScanning(false), 500);
          return 100;
        }
        return p + 5;
      });
    }, 100);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 flex items-center gap-2">
            <FiActivity className="text-primary-600 dark:text-primary-400" /> AI Home Health
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Our AI analyzes your service history, local weather patterns, and appliance lifespans to predict what needs maintenance before it breaks.
          </p>
        </div>
        <button 
          onClick={runScan}
          disabled={isScanning}
          className="btn-primary py-3 px-6 shrink-0 flex items-center gap-2 shadow-lg shadow-primary-500/30"
        >
          {isScanning ? (
            <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span> Scanning Systems...</>
          ) : (
            <><FiPlay className="fill-current" /> Run Deep Scan</>
          )}
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column - Score & Systems */}
        <div className="lg:col-span-4 space-y-8">
          {/* Score Card */}
          <div className="card p-8 text-center relative overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-dark-900 dark:to-dark-950">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
            
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-6">Overall Home Health</h3>
            
            {/* Circular Gauge */}
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-dark-800" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="8" 
                  strokeDasharray="283"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: isScanning ? 283 : 283 - (283 * healthScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {isScanning ? (
                    <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-4xl font-display font-bold text-primary-600">
                      {scanProgress}%
                    </motion.div>
                  ) : (
                    <motion.div key="score" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                      <span className="text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tight">{healthScore}</span>
                      <span className="text-sm font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1 flex items-center gap-1">
                        <FiCheckCircle /> Good
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <p className="text-sm text-slate-500 mt-6">Based on 4 active systems and recent service history.</p>
          </div>

          {/* System Status List */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">System Status</h3>
            <div className="space-y-4">
              {systems.map(sys => (
                <div key={sys.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      sys.status === 'healthy' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {sys.name === 'Electrical' ? <FiZap /> : sys.name === 'Plumbing' ? <FiDroplet /> : sys.name === 'HVAC' ? <FiWind /> : <FiTool />}
                    </div>
                    <span className="font-medium text-slate-800 dark:text-white">{sys.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-bold ${sys.status === 'healthy' ? 'text-emerald-500' : 'text-amber-500'}`}>{sys.score}%</span>
                    <span className="text-xs text-slate-400">{sys.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Recommendations */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <FiShield className="text-primary-600 text-xl" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">AI Predictive Recommendations</h2>
          </div>
          
          <AnimatePresence>
            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <motion.div 
                  key={rec.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`card p-6 border-l-4 ${
                    rec.type === 'critical' ? 'border-l-red-500' : 
                    rec.type === 'warning' ? 'border-l-amber-500' : 'border-l-blue-500'
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                      rec.type === 'critical' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 
                      rec.type === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' : 
                      'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                    }`}>
                      {rec.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                              rec.type === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 
                              rec.type === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' : 
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                            }`}>
                              {rec.type}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white">{rec.title}</h3>
                        </div>
                        <div className="text-left md:text-right">
                          <span className="block text-xl font-bold text-slate-900 dark:text-white">{rec.cost}</span>
                          <span className="text-xs text-slate-500">Estimated Cost</span>
                        </div>
                      </div>
                      
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">{rec.desc}</p>
                      
                      <div className="flex items-center gap-3">
                        <button className="btn-primary py-2 px-4 text-sm rounded-xl">Book {rec.service} Now</button>
                        <button className="btn-outline py-2 px-4 text-sm rounded-xl border-slate-200 dark:border-dark-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800">Remind Me Later</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          <div className="card p-6 bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/10 dark:to-indigo-900/10 border border-primary-100 dark:border-primary-900/30 flex items-center justify-between mt-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-dark-900 rounded-full flex items-center justify-center text-2xl shadow-sm">
                🛡️
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">CareConnect Elite</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Get free preventive maintenance on all AI recommendations.</p>
              </div>
            </div>
            <button className="btn-primary py-2 px-5 text-sm">Upgrade Plan</button>
          </div>

        </div>
      </div>
    </div>
  );
}
