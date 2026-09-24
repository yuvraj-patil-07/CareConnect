import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { FiCreditCard, FiArrowUpRight, FiArrowDownLeft, FiClock, FiPlus } from 'react-icons/fi';
import { FaCoins } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import api from '@/lib/axios.js';

export default function WalletPage() {
  const { user } = useSelector((s) => s.auth);
  const [showTopUp, setShowTopUp] = useState(false);

  // In a real app we'd fetch transaction history here
  const { data: walletData, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => api.get('/users/me').then((r) => r.data.data.user.wallet),
  });

  const wallet = walletData || user?.wallet || { balance: 0, coins: 0 };

  const mockTransactions = [
    { id: 1, type: 'credit', amount: 500, title: 'Wallet Top-up', date: new Date(), status: 'completed' },
    { id: 2, type: 'debit', amount: 250, title: 'AC Service Booking', date: new Date(Date.now() - 86400000), status: 'completed' },
    { id: 3, type: 'credit', amount: 50, title: 'Cashback - CC50', date: new Date(Date.now() - 172800000), status: 'completed' },
    { id: 4, type: 'debit', amount: 800, title: 'Plumbing Service', date: new Date(Date.now() - 400000000), status: 'completed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">
            My Wallet
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your balance and Care Coins.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Wallet Cards */}
        <div className="lg:col-span-1 space-y-4">
          {/* Main Balance Card (Credit Card Style) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 p-6 shadow-xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-2 text-white/80">
                  <FiCreditCard size={20} />
                  <span className="font-medium tracking-wide">CarePay Balance</span>
                </div>
                <div className="text-white/40">
                  <svg width="32" height="20" viewBox="0 0 32 20" fill="currentColor">
                    <circle cx="10" cy="10" r="10" />
                    <circle cx="22" cy="10" r="10" fillOpacity="0.5" />
                  </svg>
                </div>
              </div>

              <div>
                <p className="text-white/60 text-sm mb-1">Available Balance</p>
                <h2 className="text-4xl font-display font-bold text-white tracking-tight">
                  ₹{wallet.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h2>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setShowTopUp(true)}
                  className="flex-1 bg-white text-slate-900 hover:bg-slate-100 font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <FiPlus /> Add Money
                </button>
              </div>
            </div>
          </motion.div>

          {/* Care Coins Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card p-5 border border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-1 font-medium">
                  <FaCoins /> Care Coins
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {wallet.coins.toLocaleString()} <span className="text-sm font-normal text-slate-500">coins</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">100 coins = ₹10 discount</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-500">
                <FiArrowUpRight size={20} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2">
          <div className="card p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-slate-800 dark:text-white">Recent Transactions</h2>
              <button className="text-sm text-primary-600 hover:underline">View All</button>
            </div>

            <div className="space-y-4">
              {mockTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'credit' 
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' 
                        : 'bg-red-100 text-red-600 dark:bg-red-900/30'
                    }`}>
                      {tx.type === 'credit' ? <FiArrowDownLeft size={18} /> : <FiArrowUpRight size={18} />}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-white text-sm">{tx.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <FiClock size={10} /> {format(tx.date, 'MMM dd, h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800 dark:text-white'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {mockTransactions.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p>No transactions found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
