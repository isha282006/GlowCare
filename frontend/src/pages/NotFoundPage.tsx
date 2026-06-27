import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 text-center"
      style={{ background: 'linear-gradient(135deg, #FAFBFE 0%, #F0EDFF 50%, #FFE8F1 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md glass-card p-12"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="text-7xl mb-6"
        >
          🧴🫧
        </motion.div>
        
        <h1 className="text-6xl font-black mb-4 gradient-text">404</h1>
        <h2 className="text-xl font-bold mb-2">Lost in the Routine?</h2>
        <p className="text-sm mb-8 text-gray-500">
          The page you are looking for has expired or washed off. Let's get you back to your skincare dashboard.
        </p>

        <Link to="/dashboard" className="btn-primary no-underline py-3 px-8 text-sm">
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
