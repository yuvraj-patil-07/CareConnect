import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiSave, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/axios.js';
import { setCredentials } from '@/store/slices/authSlice.js';

export default function ProfilePage() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('personal');
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      city: user?.city || '',
    }
  });

  const onSubmit = async (data) => {
    setIsUpdating(true);
    try {
      const res = await api.patch('/users/me', data);
      dispatch(setCredentials({ user: res.data.data.user, token: localStorage.getItem('accessToken') }));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const uploadRes = await api.post('/upload/avatar', formData);
      const res = await api.patch('/users/me', { avatar: uploadRes.data.data.url });
      dispatch(setCredentials({ user: res.data.data.user, token: localStorage.getItem('accessToken') }));
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error('Avatar upload failed');
      setAvatarPreview(null);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your personal information and preferences.</p>
      </div>

      <div className="card overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-dark-900/50 border-r border-slate-100 dark:border-dark-800 p-4 shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab('personal')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${
              activeTab === 'personal' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800'
            }`}
          >
            <FiUser size={18} /> Personal Info
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${
              activeTab === 'security' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800'
            }`}
          >
            <FiShield size={18} /> Security
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8 flex-1">
          {activeTab === 'personal' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-dark-700 overflow-hidden border-4 border-white dark:border-dark-950 shadow-sm">
                    {avatarPreview || user?.avatar ? (
                      <img src={avatarPreview || user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-400">
                        {user?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-700 transition-colors">
                    <FiCamera size={14} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{user?.name}</h3>
                  <p className="text-slate-500 text-sm capitalize">{user?.role} Account</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        {...register('name', { required: 'Name is required' })}
                        className="input-field pl-10" 
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        {...register('email')}
                        className="input-field pl-10 bg-slate-50 dark:bg-dark-900 cursor-not-allowed" 
                        disabled
                        title="Email cannot be changed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        {...register('phone')}
                        className="input-field pl-10" 
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">City</label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        {...register('city')}
                        className="input-field pl-10" 
                        placeholder="Mumbai"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={isUpdating} className="btn-primary flex items-center gap-2">
                    {isUpdating ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <><FiSave /> Save Changes</>}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Change Password</h3>
              <form className="space-y-4 max-w-sm">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <div className="pt-2">
                  <button type="button" className="btn-primary w-full">Update Password</button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
