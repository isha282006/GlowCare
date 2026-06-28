import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiX, FiSearch } from 'react-icons/fi';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'list' | 'text' | 'avatar' | 'chart' | 'table';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 3, type = 'card' }) => {
  if (type === 'chart') {
    return (
      <div className="skeleton w-full border border-white/30" style={{ height: 260, borderRadius: 'var(--radius-card)' }} />
    );
  }

  if (type === 'avatar') {
    return <div className="skeleton rounded-full" style={{ width: 48, height: 48 }} />;
  }

  if (type === 'text') {
    return (
      <div className="space-y-3 w-full">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 16, width: `${85 - i * 12}%`, borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-card)' }} />
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-4 w-full">
        <div className="skeleton w-full" style={{ height: 48, borderRadius: 12 }} />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton w-full" style={{ height: 60, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton p-6 border border-white/20" style={{ height: 210, borderRadius: 'var(--radius-card)' }} />
      ))}
    </div>
  );
};

// SVG empty state illustrations
const BottlesIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mx-auto mb-6">
    <defs>
      <linearGradient id="blushGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FF5FA2" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#FFC7DE" stopOpacity="0.3" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F472B6" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#FFF7FB" stopOpacity="0.2" />
      </linearGradient>
    </defs>
    <rect x="15" y="95" width="90" height="6" rx="3" fill="#FFE8F1" stroke="#FF5FA2" strokeWidth="2" />
    {/* Bottle 1 */}
    <rect x="25" y="45" width="22" height="45" rx="4" fill="url(#blushGrad)" stroke="#FF5FA2" strokeWidth="2" />
    <path d="M31 45V38H41V45" stroke="#FF5FA2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="36" cy="60" r="4" fill="#FFF7FB" opacity="0.8" />
    {/* Bottle 2 */}
    <rect x="55" y="30" width="26" height="60" rx="6" fill="url(#goldGrad)" stroke="#F472B6" strokeWidth="2" />
    <path d="M63 30V22C63 20.8954 63.8954 20 65 20H71C72.1046 20 73 20.8954 73 22V30" stroke="#F472B6" strokeWidth="2" />
    <line x1="61" y1="45" x2="75" y2="45" stroke="#FFC7DE" strokeWidth="2" />
    <line x1="61" y1="52" x2="71" y2="52" stroke="#FFC7DE" strokeWidth="2" />
    {/* Droplets */}
    <path d="M92 45C92 48.3137 89.3137 51 86 51C82.6863 51 80 48.3137 80 45C80 39.5 86 34 86 34C86 34 92 39.5 92 45Z" fill="#FFE8F1" stroke="#FF5FA2" strokeWidth="1.5" />
    <circle cx="95" cy="25" r="2" fill="#F472B6" />
    <circle cx="15" cy="30" r="3" fill="#C8B6FF" />
  </svg>
);

const RoutineIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mx-auto mb-6">
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#C8B6FF" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#E8DEFF" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <circle cx="45" cy="55" r="25" fill="#FFF0F6" stroke="#FF5FA2" strokeWidth="2" strokeDasharray="4 4" />
    <circle cx="75" cy="65" r="25" fill="url(#skyGrad)" stroke="#9B8FCC" strokeWidth="2" />
    <circle cx="45" cy="55" r="8" fill="#FFE8F1" stroke="#FF5FA2" strokeWidth="1.5" />
    <path d="M45 40V43M45 67V70M30 55H33M57 55H60" stroke="#FF5FA2" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M82 58C82 66.8366 74.8366 74 66 74C65.5 74 65 73.9 64.5 73.8C68.5 72 71.5 68 71.5 63.5C71.5 59 68.5 55 64.5 53.2C65 53.1 65.5 53 66 53C74.8366 53 82 60.1634 82 58Z" fill="#FFF7FB" stroke="#9B8FCC" strokeWidth="1.5" />
    <path d="M95 35L97 40L102 42L97 44L95 49L93 44L88 42L93 40L95 35Z" fill="#C8B6FF" />
  </svg>
);

const ProgressIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mx-auto mb-6">
    <defs>
      <linearGradient id="lavGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#C8B6FF" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#FFC7DE" stopOpacity="0.4" />
      </linearGradient>
    </defs>
    <rect x="20" y="25" width="40" height="55" rx="6" fill="#FFF" stroke="#FF5FA2" strokeWidth="2" transform="rotate(-6 40 52.5)" />
    <rect x="25" y="30" width="30" height="35" rx="3" fill="#FFF0F6" transform="rotate(-6 40 52.5)" />
    
    <rect x="58" y="25" width="40" height="55" rx="6" fill="#FFF" stroke="#9B8FCC" strokeWidth="2" transform="rotate(6 78 52.5)" />
    <rect x="63" y="30" width="30" height="35" rx="3" fill="url(#lavGrad)" transform="rotate(6 78 52.5)" />
    <path d="M37 54C37 56 38.5 57 40 57C41.5 57 43 56 43 54" stroke="#FF5FA2" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="36" cy="48" r="1" fill="#FF5FA2" />
    <circle cx="44" cy="48" r="1" fill="#FF5FA2" />
    <path d="M60 85L62 90L67 92L62 94L60 99L58 94L53 92L58 90L60 85Z" fill="#F472B6" />
  </svg>
);

export const EmptyState: React.FC<{ icon: string; title: string; description: string; action?: React.ReactNode }> = ({
  icon: _icon, title, description, action,
}) => {
  // Determine which SVG illustration to show based on description or title keywords
  const lowerTitle = title.toLowerCase();
  const lowerDesc = description.toLowerCase();
  
  let illustration = <BottlesIllustration />;
  if (lowerTitle.includes('routine') || lowerDesc.includes('routine')) {
    illustration = <RoutineIllustration />;
  } else if (lowerTitle.includes('journey') || lowerTitle.includes('photo') || lowerDesc.includes('photo') || lowerDesc.includes('selfie') || lowerTitle.includes('progress')) {
    illustration = <ProgressIllustration />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card flex flex-col items-center justify-center py-16 px-6 text-center max-w-lg mx-auto border"
    >
      {illustration}
      <h3 className="text-xl font-bold mb-2 text-gray-800 tracking-tight">{title}</h3>
      <p className="text-sm mb-6 text-gray-500 max-w-sm leading-relaxed">{description}</p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </motion.div>
  );
};

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message = 'Something went wrong', onRetry,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card flex flex-col items-center justify-center py-16 px-6 text-center max-w-md mx-auto border"
  >
    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-coral mb-4 border border-red-100">
      <FiAlertCircle size={32} />
    </div>
    <h3 className="text-xl font-bold mb-2 text-gray-800">Oops!</h3>
    <p className="text-sm mb-6 text-gray-500">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-primary">
        Try Again
      </button>
    )}
  </motion.div>
);

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const widths = { sm: '24rem', md: '35rem', lg: '50rem' };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/25 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative glass-card p-6 w-full max-h-[85vh] overflow-y-auto border border-white/60 shadow-2xl"
        style={{ maxWidth: widths[size] }}
      >
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-pink-100">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-none flex items-center justify-center cursor-pointer transition-all hover:bg-pink-50 hover:text-primary bg-white/60 text-gray-400"
          >
            <FiX size={16} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

export const Pagination: React.FC<{
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2.5 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="btn-secondary px-4 py-2 text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none"
      >
        ← Prev
      </button>
      {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
        let pageNum: number;
        if (totalPages <= 5) {
          pageNum = i + 1;
        } else if (page <= 3) {
          pageNum = i + 1;
        } else if (page >= totalPages - 2) {
          pageNum = totalPages - 4 + i;
        } else {
          pageNum = page - 2 + i;
        }

        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-9 h-9 rounded-full text-xs font-bold border-none cursor-pointer transition-all flex items-center justify-center ${
              page === pageNum
                ? 'btn-primary shadow-sm'
                : 'btn-secondary bg-white/30 border-transparent hover:border-pink-200'
            }`}
          >
            {pageNum}
          </button>
        );
      })}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="btn-secondary px-4 py-2 text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none"
      >
        Next →
      </button>
    </div>
  );
};

export const SearchInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative w-full">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
      <FiSearch size={18} />
    </span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-field pl-11"
    />
  </div>
);

export const StatCard: React.FC<{
  icon: string;
  label: string;
  value: string | number;
  color?: string;
  subtext?: string;
}> = ({ icon, label, value, color, subtext }) => (
  <motion.div
    whileHover={{ y: -3 }}
    className="stat-card border border-white/40 shadow-sm relative overflow-hidden"
    style={{ borderLeft: `5px solid ${color || '#FF5FA2'}` }}
  >
    <div className="flex items-center gap-3.5 mb-2.5">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-2xl font-black text-gray-800">{value}</p>
    {subtext && <p className="text-[10px] mt-1.5 text-gray-400 font-medium">{subtext}</p>}
  </motion.div>
);
