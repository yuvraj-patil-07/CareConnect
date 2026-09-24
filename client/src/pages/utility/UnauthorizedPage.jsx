import { Link } from 'react-router-dom';
import { FiShield, FiArrowLeft } from 'react-icons/fi';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-6">
      <div className="text-center max-w-md">
        <FiShield size={64} className="mx-auto text-red-500 mb-6" />
        <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">You don't have permission to view this page.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <FiArrowLeft /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
