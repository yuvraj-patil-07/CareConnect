import { FiCalendar } from 'react-icons/fi';

export default function AdminBookings() {
  return (
    <div className="card p-8 text-center mt-10 max-w-2xl mx-auto">
      <FiCalendar size={48} className="mx-auto text-primary-400 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Booking Management</h2>
      <p className="text-slate-500 mb-6">Monitor and manage all platform bookings.</p>
    </div>
  );
}
