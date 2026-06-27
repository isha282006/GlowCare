import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiLock } from 'react-icons/fi';
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
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #FAFBFE 0%, #F0EDFF 50%, #FFE8F1 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, var(--color-lavender), var(--color-soft-pink))' }}>✨</div>
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-sm mt-1" style={{ color: '#888' }}>Enter your new password</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#999' }} />
                <input {...register('password', { required: 'Required', minLength: { value: 6, message: 'At least 6 characters' } })}
                  type="password" placeholder="New password" className="input-field pl-10" />
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--color-coral)' }}>{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#999' }} />
                <input {...register('confirmPassword', {
                  required: 'Required',
                  validate: (v: string) => v === watch('password') || 'Passwords do not match',
                })}
                  type="password" placeholder="Confirm password" className="input-field pl-10" />
              </div>
              {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: 'var(--color-coral)' }}>{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#888' }}>
            <Link to="/login" className="font-semibold no-underline" style={{ color: 'var(--color-lavender-dark)' }}>Back to Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
