import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Sparkles, ArrowLeft } from 'lucide-react';
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
          <Link to="/" className="inline-flex items-center gap-3.5 no-underline mb-2">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.05 }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md"
              style={{ background: 'linear-gradient(135deg, #FF5FA2, #FFC7DE)' }}
            >
              <Sparkles className="text-white" size={22} />
            </motion.div>
            <span className="text-3xl font-black gradient-text">GlowCare</span>
          </Link>
          <h1 className="text-2xl font-black mt-4 text-gray-800 tracking-tight">Forgot Password?</h1>
          <p className="text-sm mt-1 text-gray-500">Enter your email and we'll help you reset it</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 border border-white/50 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </span>
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                  type="email"
                  placeholder="name@example.com"
                  className="input-field pl-11"
                />
              </div>
              {errors.email && <p className="text-xs mt-1 text-coral font-semibold">{errors.email.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 mt-2 shadow-md">
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordPage;
