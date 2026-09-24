import { FiPackage } from 'react-icons/fi';

export default function ProviderBookings() {
  return (
    <div className="card p-8 text-center mt-10 max-w-2xl mx-auto">
      <FiPackage size={48} className="mx-auto text-primary-400 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Job Management</h2>
      <p className="text-slate-500 mb-6">View new requests, manage active jobs, and review completed work.</p>
    </div>
  );
}
