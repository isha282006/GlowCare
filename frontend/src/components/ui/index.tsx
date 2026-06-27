import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'list' | 'text' | 'avatar' | 'chart';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 3, type = 'card' }) => {
  if (type === 'chart') {
    return (
      <div className="skeleton w-full" style={{ height: 300, borderRadius: 'var(--radius-card)' }} />
    );
  }

  if (type === 'avatar') {
    return <div className="skeleton rounded-full" style={{ width: 48, height: 48 }} />;
  }

  if (type === 'text') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 16, width: `${80 - i * 15}%`, borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-card)' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-card)' }} />
      ))}
    </div>
  );
};

export const EmptyState: React.FC<{ icon: string; title: string; description: string; action?: React.ReactNode }> = ({
  icon, title, description, action,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 text-center"
  >
    <span className="text-6xl mb-4">{icon}</span>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-sm mb-6" style={{ color: '#888' }}>{description}</p>
    {action}
  </motion.div>
);

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message = 'Something went wrong', onRetry,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 text-center"
  >
    <span className="text-6xl mb-4">😔</span>
    <h3 className="text-xl font-bold mb-2">Oops!</h3>
    <p className="text-sm mb-6" style={{ color: '#888' }}>{message}</p>
    {onRetry && <button onClick={onRetry} className="btn-primary">Try Again</button>}
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

  const widths = { sm: '24rem', md: '32rem', lg: '48rem' };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative glass-card p-6 w-full max-h-[90vh] overflow-y-auto"
        style={{ maxWidth: widths[size] }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl border-none cursor-pointer hover:opacity-70 transition-opacity"
            style={{ background: 'rgba(200, 182, 255, 0.15)', color: 'inherit' }}>✕</button>
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
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="btn-secondary px-3 py-2 text-sm disabled:opacity-40"
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
            className={`w-10 h-10 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all ${
              page === pageNum ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            {pageNum}
          </button>
        );
      })}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="btn-secondary px-3 py-2 text-sm disabled:opacity-40"
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
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-field pl-10"
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
    whileHover={{ y: -2 }}
    className="stat-card"
    style={{ borderLeft: `4px solid ${color || 'var(--color-lavender)'}` }}
  >
    <div className="flex items-center gap-3 mb-2">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium" style={{ color: '#888' }}>{label}</span>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {subtext && <p className="text-xs mt-1" style={{ color: '#aaa' }}>{subtext}</p>}
  </motion.div>
);
