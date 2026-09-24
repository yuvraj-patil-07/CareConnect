import { FiWifiOff } from 'react-icons/fi';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-6">
      <div className="text-center max-w-md">
        <FiWifiOff size={64} className="mx-auto text-slate-400 mb-6" />
        <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-2">You're Offline</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">Please check your internet connection and try again.</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Retry Connection
        </button>
      </div>
    </div>
  );
}
