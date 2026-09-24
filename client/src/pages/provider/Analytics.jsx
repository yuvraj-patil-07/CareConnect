import { FiTrendingUp } from 'react-icons/fi';

export default function ProviderAnalytics() {
  return (
    <div className="card p-8 text-center mt-10 max-w-2xl mx-auto">
      <FiTrendingUp size={48} className="mx-auto text-emerald-400 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Earnings & Insights</h2>
      <p className="text-slate-500 mb-6">Detailed breakdown of your earnings, completed jobs, and trust score trends.</p>
    </div>
  );
}
