import { FiCalendar } from 'react-icons/fi';

export default function ProviderAvailability() {
  return (
    <div className="card p-8 text-center mt-10 max-w-2xl mx-auto">
      <FiCalendar size={48} className="mx-auto text-primary-400 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Availability Schedule</h2>
      <p className="text-slate-500 mb-6">Set your working hours, breaks, and holiday schedule.</p>
    </div>
  );
}
