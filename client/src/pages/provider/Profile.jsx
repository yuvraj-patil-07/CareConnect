import { FiUser } from 'react-icons/fi';

export default function ProviderProfile() {
  return (
    <div className="card p-8 text-center mt-10 max-w-2xl mx-auto">
      <FiUser size={48} className="mx-auto text-primary-400 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Provider Profile</h2>
      <p className="text-slate-500 mb-6">Manage your public portfolio, bio, skills, and categories.</p>
    </div>
  );
}
