import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMic, FiMicOff, FiSearch, FiCalendar, FiMapPin, FiCheckCircle,
  FiArrowRight, FiArrowLeft, FiZap, FiClock, FiAlertCircle,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import api from '@/lib/axios.js';
import { useSelector } from 'react-redux';

const STEPS = [
  { id: 1, label: 'Describe Issue', icon: <FiSearch size={16} /> },
  { id: 2, label: 'Date & Time', icon: <FiCalendar size={16} /> },
  { id: 3, label: 'Address', icon: <FiMapPin size={16} /> },
  { id: 4, label: 'Confirm', icon: <FiCheckCircle size={16} /> },
];

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM',
];

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingData, setBookingData] = useState({});
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [searchParams] = useSearchParams();
  const recognitionRef = useRef(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { description: '' },
  });

  const description = watch('description');

  // AI Smart Search
  const aiSearchMutation = useMutation({
    mutationFn: (text) => api.post('/ai/smart-search', { query: text }).then((r) => r.data.data),
    onSuccess: (data) => {
      setAiSuggestions(data?.services || []);
      if (data?.services?.length > 0) setSelectedService(data.services[0]);
    },
    onError: () => toast.error('AI search failed. Please try again.'),
  });

  // Create Booking
  const createBookingMutation = useMutation({
    mutationFn: (payload) => api.post('/bookings', payload).then((r) => r.data.data),
    onSuccess: (data) => {
      toast.success('Booking created successfully! 🎉');
      navigate(`/bookings/${data.booking?._id || data._id}`);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Booking failed. Please try again.'),
  });

  const handleAiSearch = () => {
    if (!description?.trim()) return;
    aiSearchMutation.mutate(description);
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser.');
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setValue('description', description + (description ? ' ' : '') + transcript);
    };
    recognition.onerror = () => { setIsRecording(false); toast.error('Voice input error'); };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const nextStep = (data = {}) => {
    setBookingData((prev) => ({ ...prev, ...data }));
    if (step < 4) setStep((s) => s + 1);
  };

  const confirmBooking = (addressData) => {
    const payload = {
      ...bookingData,
      ...addressData,
      serviceId: selectedService?._id,
      scheduledDate: selectedDate && selectedTime
        ? new Date(`${selectedDate} ${selectedTime}`).toISOString()
        : undefined,
    };
    createBookingMutation.mutate(payload);
  };

  const upcomingDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">
          Book a Service
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Describe your problem — AI will find the right professional.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="card p-4">
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all font-semibold text-sm ${
                    step > s.id
                      ? 'bg-emerald-500 text-white'
                      : step === s.id
                      ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900/30'
                      : 'bg-slate-100 dark:bg-dark-700 text-slate-400'
                  }`}
                >
                  {step > s.id ? <FiCheckCircle size={16} /> : s.icon}
                </div>
                <span className={`text-xs mt-1.5 font-medium hidden sm:block ${step === s.id ? 'text-primary-600' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all ${step > s.id ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-dark-600'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Step 1 – Describe Issue */}
          {step === 1 && (
            <div className="card p-6 space-y-5">
              <div>
                <div className="flex items-center gap-2 text-sm text-primary-600 font-medium mb-1">
                  <HiSparkles size={14} /> AI-Powered Search
                </div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">What needs fixing?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Describe in your own words or use voice input. AI will identify the service needed.
                </p>
              </div>

              <div>
                <div className="relative">
                  <textarea
                    {...register('description', { required: 'Please describe your issue' })}
                    rows={4}
                    placeholder="e.g., 'My bathroom tap is leaking and there's water dripping under the sink' or 'I need a full home deep clean before Diwali'…"
                    className={`input resize-none pr-14 ${errors.description ? 'input-error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={`absolute right-3 bottom-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                    }`}
                  >
                    {isRecording ? <FiMicOff size={16} /> : <FiMic size={16} />}
                  </button>
                </div>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                {isRecording && (
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="flex items-center gap-2 text-xs text-red-500 mt-2"
                  >
                    <span className="w-2 h-2 bg-red-500 rounded-full" /> Listening…
                  </motion.div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAiSearch}
                disabled={!description?.trim() || aiSearchMutation.isPending}
                className="btn-primary w-full"
              >
                {aiSearchMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI is analyzing…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FiZap size={16} /> Find Best Services
                  </span>
                )}
              </button>

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">
                    ✨ AI Recommendations:
                  </p>
                  <div className="space-y-2">
                    {aiSuggestions.map((svc) => (
                      <button
                        key={svc._id}
                        type="button"
                        onClick={() => setSelectedService(svc)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selectedService?._id === svc._id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-slate-200 dark:border-dark-600 hover:border-primary-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{svc.icon || '🔧'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 dark:text-white">{svc.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{svc.description}</p>
                            {svc.basePrice && (
                              <p className="text-xs font-semibold text-primary-600 mt-1">Starting ₹{svc.basePrice}</p>
                            )}
                          </div>
                          {selectedService?._id === svc._id && (
                            <FiCheckCircle className="text-primary-600 flex-shrink-0" size={18} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedService && (
                <button
                  type="button"
                  onClick={() => nextStep({ description, serviceId: selectedService._id, serviceName: selectedService.name })}
                  className="btn-primary w-full"
                >
                  Continue with {selectedService.name} <FiArrowRight size={16} />
                </button>
              )}

              {aiSuggestions.length === 0 && !aiSearchMutation.isPending && (
                <button
                  type="button"
                  onClick={() => nextStep({ description })}
                  className="btn-secondary w-full text-sm"
                >
                  Skip AI Matching & Continue Manually
                </button>
              )}
            </div>
          )}

          {/* Step 2 – Date & Time */}
          {step === 2 && (
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-1">When do you need this?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Choose a convenient date and time slot.</p>
              </div>

              {/* Date Selector */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">Select Date</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {upcomingDates.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => setSelectedDate(dateStr)}
                        className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 text-xs transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-600 text-white'
                            : 'border-slate-200 dark:border-dark-600 hover:border-primary-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="font-medium">{format(date, 'EEE')}</span>
                        <span className={`text-lg font-bold my-0.5 ${isSelected ? 'text-white' : ''}`}>{format(date, 'd')}</span>
                        <span>{format(date, 'MMM')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">Select Time</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-2.5 px-2 rounded-xl border-2 text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                        selectedTime === time
                          ? 'border-primary-500 bg-primary-600 text-white'
                          : 'border-slate-200 dark:border-dark-600 hover:border-primary-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <FiClock size={10} /> {time}
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && selectedTime && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-400">
                  ✅ Scheduled: <strong>{format(new Date(selectedDate), 'EEEE, dd MMM yyyy')}</strong> at <strong>{selectedTime}</strong>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                  <FiArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => nextStep({ scheduledDate: selectedDate, scheduledTime: selectedTime })}
                  disabled={!selectedDate || !selectedTime}
                  className="btn-primary flex-1"
                >
                  Continue <FiArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 – Address */}
          {step === 3 && (
            <AddressStep onBack={() => setStep(2)} onNext={nextStep} user={user} />
          )}

          {/* Step 4 – Confirm */}
          {step === 4 && (
            <ConfirmStep
              bookingData={bookingData}
              selectedService={selectedService}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onBack={() => setStep(3)}
              onConfirm={(data) => confirmBooking(data)}
              isLoading={createBookingMutation.isPending}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AddressStep({ onBack, onNext, user }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      addressLine1: user?.addresses?.[0]?.line1 || '',
      addressLine2: user?.addresses?.[0]?.line2 || '',
      city: user?.addresses?.[0]?.city || '',
      pincode: user?.addresses?.[0]?.pincode || '',
    },
  });

  const savedAddresses = user?.addresses || [];

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-1">Service Address</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Where should the professional come?</p>

      {savedAddresses.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Saved Addresses</p>
          <div className="space-y-2">
            {savedAddresses.slice(0, 3).map((addr, i) => (
              <button
                key={i}
                type="button"
                className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-dark-600 hover:border-primary-400 text-sm text-slate-700 dark:text-slate-300 transition-colors"
                onClick={() => {
                  onNext({
                    addressLine1: addr.line1,
                    addressLine2: addr.line2,
                    city: addr.city,
                    pincode: addr.pincode,
                  });
                }}
              >
                <div className="flex items-start gap-2">
                  <FiMapPin size={14} className="text-primary-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{addr.label || 'Home'}</p>
                    <p className="text-xs text-slate-400">{addr.line1}, {addr.city} - {addr.pincode}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-200 dark:bg-dark-600" />
            <span className="text-xs text-slate-400">or enter new address</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-dark-600" />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit((data) => onNext(data))} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Address Line 1</label>
          <input
            {...register('addressLine1', { required: 'Address is required' })}
            placeholder="Flat/House No, Building, Street"
            className={`input ${errors.addressLine1 ? 'input-error' : ''}`}
          />
          {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Address Line 2 (Optional)</label>
          <input
            {...register('addressLine2')}
            placeholder="Landmark, Area"
            className="input"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">City</label>
            <input
              {...register('city', { required: 'City is required' })}
              placeholder="Mumbai"
              className={`input ${errors.city ? 'input-error' : ''}`}
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Pincode</label>
            <input
              {...register('pincode', { required: 'Pincode required', pattern: { value: /^\d{6}$/, message: '6-digit pincode' } })}
              placeholder="400001"
              className={`input ${errors.pincode ? 'input-error' : ''}`}
            />
            {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack} className="btn-secondary flex-1">
            <FiArrowLeft size={16} /> Back
          </button>
          <button type="submit" className="btn-primary flex-1">
            Continue <FiArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

function ConfirmStep({ bookingData, selectedService, selectedDate, selectedTime, onBack, onConfirm, isLoading }) {
  return (
    <div className="card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-1">Confirm Booking</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Review details before confirming.</p>
      </div>

      <div className="space-y-3">
        {[
          { label: 'Service', value: selectedService?.name || bookingData?.serviceName || 'To be determined' },
          { label: 'Description', value: bookingData?.description || '—' },
          { label: 'Date & Time', value: selectedDate && selectedTime ? `${format(new Date(selectedDate), 'dd MMM yyyy')} at ${selectedTime}` : '—' },
          { label: 'Address', value: [bookingData?.addressLine1, bookingData?.city, bookingData?.pincode].filter(Boolean).join(', ') || '—' },
        ].map((item) => (
          <div key={item.label} className="flex justify-between gap-4 py-3 border-b border-slate-100 dark:border-dark-700 last:border-0">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{item.label}</span>
            <span className="text-sm text-slate-800 dark:text-white text-right max-w-[60%]">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
        <FiAlertCircle size={16} className="flex-shrink-0 mt-0.5" />
        <p>You'll be matched with available providers near you. Final pricing will be quoted before service starts.</p>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary flex-1" disabled={isLoading}>
          <FiArrowLeft size={16} /> Back
        </button>
        <button
          type="button"
          onClick={() => onConfirm(bookingData)}
          className="btn-primary flex-1 py-3.5"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Booking…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FiCheckCircle size={16} /> Confirm Booking
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
