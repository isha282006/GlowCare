import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authService, uploadService } from '../api/services';

interface ProfileFormData {
  name: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const profilePicUrl = user?.profilePhoto || user?.profilePicture;
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profilePicUrl ? (profilePicUrl.startsWith('http') ? profilePicUrl : `http://localhost:5000${profilePicUrl}`) : null
  );

  const { register: regProfile, handleSubmit: handleProfileSubmit, formState: { isSubmitting: isSubmittingProfile } } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    }
  });

  const { register: regPassword, handleSubmit: handlePasswordSubmit, reset: resetPasswordForm, watch, formState: { errors, isSubmitting: isSubmittingPass } } = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      uploadAvatar(file);
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadService.uploadProfilePhoto(formData);
      updateUser(res.data.user);
      const newPic = res.data.imageUrl;
      setAvatarPreview(newPic.startsWith('http') ? newPic : `http://localhost:5000${newPic}`);
      showToast('Profile picture updated successfully! 📸', 'success');
    } catch {
      showToast('Failed to upload profile picture', 'error');
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      const res = await authService.updateProfile(data);
      updateUser(res.data.user);
      showToast('Profile updated successfully! ✨', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      showToast('Password changed successfully!', 'success');
      resetPasswordForm();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to change password', 'error');
    }
  };

  return (
    <div className="page-container max-w-4xl relative z-10">
      <div className="mb-8 text-left">
        <h1 className="page-title flex items-center gap-2">My Profile 👤</h1>
        <p className="page-subtitle">Manage your account information, profile photo, and password credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Avatar Widget */}
        <div className="md:col-span-1">
          <div className="glass-card p-6.5 flex flex-col items-center text-center border border-white/40 shadow-sm">
            <div className="relative mb-5 group">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-pink-100 shadow-md transition-all group-hover:scale-102" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-pink-50/50 flex items-center justify-center text-4xl border-4 border-pink-100 shadow-md font-black">
                  {user?.name?.charAt(0) || '👤'}
                </div>
              )}
              <label className="absolute bottom-1 right-1 bg-white border border-pink-200/50 p-2.5 rounded-full cursor-pointer shadow-lg hover:scale-105 transition-transform flex items-center justify-center">
                <Upload size={14} className="text-primary" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            
            <h3 className="font-extrabold text-sm text-gray-800 leading-tight">{user?.name}</h3>
            <p className="text-xs text-gray-400 font-semibold mb-3 mt-1.5">{user?.email}</p>
            <span className="badge badge-lavender uppercase tracking-widest text-[9px] font-black">
              {user?.role} Role
            </span>
          </div>
        </div>

        {/* Profile Form Details */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Edit Details */}
          <div className="glass-card p-6.5 border border-white/40 shadow-sm text-left">
            <h3 className="font-black text-sm mb-4.5 flex items-center gap-2 text-gray-700">
              <User size={16} className="text-primary" /> Account Details
            </h3>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Full Name</label>
                <input {...regProfile('name')} className="input-field" placeholder="Enter full name" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Email Address</label>
                <input {...regProfile('email')} type="email" className="input-field" placeholder="Enter email" />
              </div>
              <button type="submit" disabled={isSubmittingProfile} className="btn-primary w-full py-3.5 shadow-md cursor-pointer pt-2">
                {isSubmittingProfile ? 'Saving...' : 'Update Details'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="glass-card p-6.5 border border-white/40 shadow-sm text-left">
            <h3 className="font-black text-sm mb-4.5 flex items-center gap-2 text-gray-700">
              <Lock size={16} className="text-primary" /> Change Password
            </h3>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Current Password</label>
                <input {...regPassword('currentPassword', { required: 'Required' })} type="password" className="input-field" placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">New Password</label>
                  <input {...regPassword('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} type="password" className="input-field" placeholder="••••••••" />
                  {errors.newPassword && <p className="text-[10px] text-coral mt-1 font-semibold">{errors.newPassword.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Confirm New Password</label>
                  <input {...regPassword('confirmPassword', {
                    required: 'Required',
                    validate: (v: string) => v === watch('newPassword') || 'Passwords do not match'
                  })} type="password" className="input-field" placeholder="••••••••" />
                  {errors.confirmPassword && <p className="text-[10px] text-coral mt-1 font-semibold">{errors.confirmPassword.message}</p>}
                </div>
              </div>
              <button type="submit" disabled={isSubmittingPass} className="btn-secondary w-full py-3.5 shadow-sm cursor-pointer pt-2">
                {isSubmittingPass ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
