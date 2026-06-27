import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiMail } from 'react-icons/fi';
import { authService } from '../../api/services';
import { useToast } from '../../contexts/ToastContext';

const ForgotPasswordPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>();
  const { showToast } = useToast();

  const onSubmit = async (data: { email: string }) => {
    try {
      const response = await authService.forgotPassword(data.email);
      showToast('Password reset instructions sent! Check the console for the reset token.', 'success');
      console.log('Reset token:', response.data.resetToken);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to send reset email', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #FAFBFE 0%, #F0EDFF 50%, #FFE8F1 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 no-underline mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'linear-gradient(135deg, var(--color-lavender), var(--color-soft-pink))' }}>✨</div>
            <span className="text-2xl font-bold gradient-text">GlowCare</span>
          </Link>
          <h1 className="text-2xl font-bold mt-4">Forgot Password?</h1>
          <p className="text-sm mt-1" style={{ color: '#888' }}>Enter your email and we'll help you reset it</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#999' }} />
                <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                  type="email" placeholder="Enter your email" className="input-field pl-10" />
              </div>
              {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--color-coral)' }}>{errors.email.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#888' }}>
            Remember your password?{' '}
            <Link to="/login" className="font-semibold no-underline" style={{ color: 'var(--color-lavender-dark)' }}>Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
