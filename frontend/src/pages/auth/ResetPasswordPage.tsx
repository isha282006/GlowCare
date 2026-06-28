import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Lock, Sparkles, ArrowLeft } from 'lucide-react';
import { authService } from '../../api/services';
import { useToast } from '../../contexts/ToastContext';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<{ password: string; confirmPassword: string }>();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (data: { password: string }) => {
    try {
      await authService.resetPassword(token!, data.password);
      showToast('Password reset successful!', 'success');
      navigate('/login');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Reset failed', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Background Blobs Layer */}
      <div className="glow-bg-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #FF5FA2, #FFC7DE)' }}>
            <Sparkles className="text-white" size={22} />
          </div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Reset Password</h1>
          <p className="text-sm mt-1 text-gray-500">Enter your new password below</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 border border-white/50 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">New Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
                  type="password"
                  placeholder="New password"
                  className="input-field pl-11"
                />
              </div>
              {errors.password && <p className="text-xs mt-1 text-coral font-semibold">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  {...register('confirmPassword', {
                    required: 'Required',
                    validate: (v: string) => v === watch('password') || 'Passwords do not match',
                  })}
                  type="password"
                  placeholder="Confirm password"
                  className="input-field pl-11"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs mt-1 text-coral font-semibold">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 mt-3 shadow-md">
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="text-center text-xs mt-6 text-gray-500">
            <Link to="/login" className="font-bold no-underline text-primary hover:underline flex items-center justify-center gap-1.5">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
