import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiClock, FiMapPin, FiUser, FiPhone, FiMessageSquare, FiShield, FiFileText, FiCheckCircle, FiDollarSign, FiChevronRight } from 'react-icons/fi';
import { format } from 'date-fns';
import api from '@/lib/axios.js';

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // In a real app, we'd fetch the booking by ID
  // Using mock data for demonstration if API fails or ID isn't real
  const { data: bookingData, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => api.get(`/bookings/${id}`).then((r) => r.data.data.booking),
    retry: false
  });

  const booking = bookingData || {
    _id: id || 'BKG-9921',
    bookingNumber: 'CC49281A',
    status: 'accepted',
    service: { name: 'AC Deep Cleaning', category: 'AC Repair' },
    scheduledDate: new Date(),
    scheduledTimeSlot: { start: '10:00 AM', end: '12:00 PM' },
    serviceLocation: { address: '404 Palm Heights, Andheri West', city: 'Mumbai', pincode: '400053' },
    description: 'AC is making a loud noise and not cooling properly.',
    provider: { name: 'Rahul Sharma', rating: 4.8, jobs: 142, avatar: 'https://i.pravatar.cc/150?img=11', phone: '+91 9876543210' },
    finalPrice: 899,
    platformFee: 50,
    paymentStatus: 'pending'
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/bookings" className="text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 text-sm font-medium mb-2 w-fit">
            <FiChevronRight className="rotate-180" /> Back to Bookings
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">
              {booking.service.name}
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              booking.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
              booking.status === 'accepted' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' :
              booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {booking.status}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Booking #{booking.bookingNumber}</p>
        </div>
        
        {booking.status === 'accepted' && (
          <button 
            onClick={() => navigate(`/bookings/${booking._id}/track`)}
            className="btn-primary shrink-0 w-full sm:w-auto flex justify-center items-center gap-2"
          >
            <FiMapPin /> Track Live
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left Column - Details */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Schedule & Location */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <FiFileText className="text-primary-500" /> Service Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0">
                  <FiClock size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1">Schedule</p>
                  <p className="font-medium text-slate-800 dark:text-white">{format(new Date(booking.scheduledDate), 'MMM dd, yyyy')}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{booking.scheduledTimeSlot.start} - {booking.scheduledTimeSlot.end}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 shrink-0">
                  <FiMapPin size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1">Location</p>
                  <p className="font-medium text-slate-800 dark:text-white line-clamp-2">{booking.serviceLocation.address}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{booking.serviceLocation.city}, {booking.serviceLocation.pincode}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-dark-800">
              <p className="text-xs text-slate-500 font-medium uppercase mb-2">Issue Description</p>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed bg-slate-50 dark:bg-dark-900/50 p-4 rounded-xl">
                "{booking.description}"
              </p>
            </div>
          </div>

          {/* Provider Details (If assigned) */}
          {booking.provider ? (
            <div className="card p-6 border border-primary-100 dark:border-primary-900/30">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <FiUser className="text-primary-500" /> Assigned Professional
              </h3>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative">
                    <img src={booking.provider.avatar} alt={booking.provider.name} className="w-16 h-16 rounded-full object-cover shadow-sm" />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1 rounded-full border-2 border-white dark:border-dark-900">
                      <FiShield className="text-white w-3 h-3" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{booking.provider.name}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <span className="text-amber-500 font-bold">★ {booking.provider.rating}</span>
                      <span>({booking.provider.jobs} jobs)</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link to="/chat" className="btn-outline flex-1 sm:flex-none justify-center gap-2 border-slate-200 dark:border-dark-700">
                    <FiMessageSquare /> Chat
                  </Link>
                  <a href={`tel:${booking.provider.phone}`} className="btn-primary flex-1 sm:flex-none justify-center gap-2 shadow-md shadow-primary-500/20">
                    <FiPhone /> Call
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-dark-900 border-dashed">
              <div className="w-12 h-12 bg-slate-200 dark:bg-dark-800 rounded-full flex items-center justify-center mb-3">
                <FiUser className="text-slate-400 text-xl" />
              </div>
              <h4 className="font-medium text-slate-800 dark:text-slate-200">Finding the perfect professional...</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">We are matching your request with top-rated professionals in your area. You'll be notified shortly.</p>
            </div>
          )}

        </div>

        {/* Right Column - Billing & Action */}
        <div className="space-y-6">
          <div className="card p-6 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl" />
            <h3 className="font-semibold text-white/90 mb-6 flex items-center gap-2">
              <FiDollarSign className="text-emerald-400" /> Payment Summary
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Service Charge</span>
                <span>₹{booking.finalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Platform Fee</span>
                <span>₹{booking.platformFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Taxes & GST</span>
                <span>₹{Math.round(booking.finalPrice * 0.18)}</span>
              </div>
              
              <div className="border-t border-white/10 pt-3 mt-3 flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span className="text-emerald-400">₹{booking.finalPrice + booking.platformFee + Math.round(booking.finalPrice * 0.18)}</span>
              </div>
            </div>

            <div className="mt-8">
              {booking.paymentStatus === 'paid' ? (
                <div className="w-full py-3 bg-emerald-500/20 text-emerald-400 font-semibold rounded-xl flex items-center justify-center gap-2">
                  <FiCheckCircle /> Payment Successful
                </div>
              ) : (
                <button className="w-full py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl transition-colors shadow-lg">
                  Proceed to Pay
                </button>
              )}
            </div>
          </div>

          <div className="card p-4">
            <h4 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">Support & Help</h4>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 rounded-lg transition-colors">Reschedule Booking</button>
              <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">Cancel Booking</button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
