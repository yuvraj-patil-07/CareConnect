import { FiBell } from 'react-icons/fi';

export default function NotificationsPage() {
  return (
    <div className="card p-8 text-center mt-10 max-w-2xl mx-auto">
      <FiBell size={48} className="mx-auto text-amber-400 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Notifications</h2>
      <p className="text-slate-500 mb-6">All your alerts, booking updates, and announcements in one place.</p>
    </div>
  );
}
