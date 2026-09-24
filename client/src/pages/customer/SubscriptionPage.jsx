import { useState } from 'react';
import { FiCheck, FiStar, FiShield, FiZap, FiPhoneCall } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState('yearly'); // monthly | yearly

  const plans = [
    {
      id: 'free',
      name: 'Basic',
      price: { monthly: 0, yearly: 0 },
      desc: 'Pay per service with standard support.',
      icon: <FiCheck className="text-slate-500" />,
      features: [
        'Pay per service booking',
        'Standard customer support',
        'Basic background checks on providers',
        '30-day service guarantee'
      ],
      buttonText: 'Current Plan',
      isPopular: false,
      color: 'slate'
    },
    {
      id: 'plus',
      name: 'Care Plus',
      price: { monthly: 299, yearly: 2990 },
      desc: 'Priority booking and discounted rates for regular users.',
      icon: <FiStar className="text-primary-500" />,
      features: [
        '10% off all services',
        'Priority provider matching',
        'Zero platform fees',
        'Extended 60-day guarantee',
        'Priority 24/7 customer support'
      ],
      buttonText: 'Upgrade to Plus',
      isPopular: true,
      color: 'primary'
    },
    {
      id: 'elite',
      name: 'Care Elite',
      price: { monthly: 999, yearly: 9990 },
      desc: 'The ultimate home maintenance autopilot powered by AI.',
      icon: <FiShield className="text-amber-500" />,
      features: [
        '2 Free AC/Plumbing services per year',
        '20% off all additional services',
        'Dedicated account manager',
        'AI Home Health Predictive Scans',
        '1-hour emergency response guarantee',
        'Zero platform fees'
      ],
      buttonText: 'Upgrade to Elite',
      isPopular: false,
      color: 'amber'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
          Upgrade your <span className="text-primary-600">Home Care</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Join thousands of homeowners who save time and money with CareConnect Elite.
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <span className={`text-sm font-semibold ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Monthly</span>
          <button 
            onClick={() => setBillingCycle(b => b === 'monthly' ? 'yearly' : 'monthly')}
            className="w-14 h-7 bg-slate-200 dark:bg-dark-800 rounded-full relative shadow-inner"
          >
            <motion.div 
              className="w-5 h-5 bg-primary-600 rounded-full absolute top-1 shadow-sm"
              animate={{ left: billingCycle === 'monthly' ? '4px' : '32px' }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Yearly</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
              Save 20%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto px-4">
        {plans.map((plan, idx) => (
          <motion.div 
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
            className={`relative rounded-3xl bg-white dark:bg-dark-900 shadow-xl border-2 transition-all ${
              plan.isPopular 
                ? 'border-primary-500 shadow-primary-500/20 md:-translate-y-4 z-10' 
                : 'border-slate-100 dark:border-dark-800 hover:border-slate-300 dark:hover:border-dark-700'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary-500 to-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                Most Popular
              </div>
            )}
            
            <div className="p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${plan.color}-100 dark:bg-${plan.color}-900/20 text-${plan.color}-600 dark:text-${plan.color}-400`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">{plan.name}</h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 min-h-[40px] mb-6">{plan.desc}</p>
              
              <div className="mb-8">
                <span className="text-4xl font-display font-bold text-slate-900 dark:text-white">
                  ₹{plan.price[billingCycle].toLocaleString()}
                </span>
                <span className="text-slate-500 font-medium">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              
              <button className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-sm ${
                plan.isPopular 
                  ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/25 hover:shadow-primary-500/40' 
                  : plan.id === 'free'
                  ? 'bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
              }`}>
                {plan.buttonText}
              </button>
            </div>
            
            <div className="p-8 border-t border-slate-100 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/50 rounded-b-3xl">
              <ul className="space-y-4">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    <FiCheck className={`shrink-0 mt-0.5 ${plan.isPopular ? 'text-primary-500' : 'text-emerald-500'}`} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Guarantee Section */}
      <div className="max-w-3xl mx-auto pt-8">
        <div className="card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 bg-gradient-to-r from-slate-50 to-white dark:from-dark-900 dark:to-dark-950">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <FiShield size={32} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">100% Satisfaction Guarantee</h3>
            <p className="text-slate-500 dark:text-slate-400">
              Cancel or switch your plan anytime. If you're not satisfied with your Elite service within the first 30 days, we'll refund your subscription fee. No questions asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
