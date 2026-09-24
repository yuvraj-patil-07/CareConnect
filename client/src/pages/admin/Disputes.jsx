import { FiShield } from 'react-icons/fi';

export default function AdminDisputes() {
  return (
    <div className="card p-8 text-center mt-10 max-w-2xl mx-auto">
      <FiShield size={48} className="mx-auto text-red-400 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Dispute Resolution</h2>
      <p className="text-slate-500 mb-6">Handle customer and provider disputes and refunds.</p>
    </div>
  );
}
