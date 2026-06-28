import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();
  const { login, user, token, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (!loading && token) {
      if (user?.onboardingCompleted) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [token, user, loading, navigate]);

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await login(data.email, data.password);
      showToast('Welcome back! 🌟', 'success');
      if (res?.user?.onboardingCompleted) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Login failed', 'error');
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
          <h1 className="text-2xl font-black mt-4 text-gray-800 tracking-tight">Welcome Back</h1>
          <p className="text-sm mt-1 text-gray-500">Sign in to continue your skincare journey</p>
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

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  className="input-field pl-11 pr-11"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1 text-coral font-semibold">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-semibold no-underline text-primary hover:text-primary-dark">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 mt-2 shadow-md">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs mt-6 text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold no-underline text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
