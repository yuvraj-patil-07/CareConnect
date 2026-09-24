import { FiBriefcase } from 'react-icons/fi';

export default function AdminProviders() {
  return (
    <div className="card p-8 text-center mt-10 max-w-2xl mx-auto">
      <FiBriefcase size={48} className="mx-auto text-primary-400 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Provider Management</h2>
      <p className="text-slate-500 mb-6">Review verifications, manage provider accounts, and handle onboarding.</p>
    </div>
  );
}
