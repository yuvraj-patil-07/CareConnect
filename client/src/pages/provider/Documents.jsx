import { FiFileText } from 'react-icons/fi';

export default function ProviderDocuments() {
  return (
    <div className="card p-8 text-center mt-10 max-w-2xl mx-auto">
      <FiFileText size={48} className="mx-auto text-primary-400 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Documents & Verification</h2>
      <p className="text-slate-500 mb-6">Upload and manage your ID, certifications, and background check documents.</p>
    </div>
  );
}
