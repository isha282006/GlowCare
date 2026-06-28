import React from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authService } from '../api/services';
import AvatarManager from '../components/AvatarManager';

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
          <div className="glass-card p-6.5 flex flex-col items-center text-center border border-white/40 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">Profile Photo</h3>
              <AvatarManager size="xl" />
            </div>

            <div className="text-left w-full space-y-2 bg-pink-50/20 p-3.5 rounded-2xl border border-pink-100/10 text-[10px] font-semibold text-gray-500">
              <span className="font-bold text-primary block uppercase tracking-wider text-[8px] mb-1">Image Metadata</span>
              <p><span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Status:</span> {user?.profilePhoto ? 'Uploaded & Synced' : 'Default Initials'}</p>
              <p><span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Storage:</span> MongoDB Permanent</p>
              {user?.profilePhoto && (
                <>
                  <p><span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Sync Date:</span> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  <p><span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Format:</span> Web-Optimized JPG</p>
                </>
              )}
            </div>
            
            <div className="pt-2">
              <h3 className="font-extrabold text-sm text-gray-800 leading-tight">{user?.name}</h3>
              <p className="text-xs text-gray-400 font-semibold mb-3 mt-1.5">{user?.email}</p>
              <span className="badge badge-lavender uppercase tracking-widest text-[9px] font-black">
                {user?.role} Role
              </span>
            </div>
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
