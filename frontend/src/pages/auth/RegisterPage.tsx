import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>();
  const { register: registerUser, user, token, loading } = useAuth();
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

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data.name, data.email, data.password);
      showToast('Account created! Welcome to GlowCare ✨', 'success');
      navigate('/onboarding');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Registration failed', 'error');
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
          <h1 className="text-2xl font-black mt-4 text-gray-800 tracking-tight">Create Account</h1>
          <p className="text-sm mt-1 text-gray-500">Start your personalized skincare journey</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 border border-white/50 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </span>
                <input
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
                  placeholder="Enter your name"
                  className="input-field pl-11"
                />
              </div>
              {errors.name && <p className="text-xs mt-1 text-coral font-semibold">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
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
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
                      message: 'Password must contain at least one uppercase, lowercase, number, and special character'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create password"
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

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (val: string) => val === watch('password') || 'Passwords do not match',
                  })}
                  type="password"
                  placeholder="Confirm password"
                  className="input-field pl-11"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs mt-1 text-coral font-semibold">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 mt-3 shadow-md">
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs mt-6 text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold no-underline text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
