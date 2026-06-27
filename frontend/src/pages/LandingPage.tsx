import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShield, FiBarChart2, FiBook, FiStar, FiBox, FiHeart } from 'react-icons/fi';

const features = [
  { icon: <FiBox size={24} />, title: 'Product Inventory', desc: 'Track all your skincare products, expiry dates, and quantities in one place.', color: 'var(--color-lavender)' },
  { icon: <FiStar size={24} />, title: 'Routine Builder', desc: 'Build and track your morning and night skincare routines with drag-and-drop.', color: 'var(--color-soft-pink)' },
  { icon: <FiBook size={24} />, title: 'Skin Journal', desc: 'Log your daily skin condition, water intake, sleep, and mood.', color: 'var(--color-mint)' },
  { icon: <FiShield size={24} />, title: 'Compatibility Check', desc: 'Automatically detect ingredient conflicts in your routine.', color: 'var(--color-sky)' },
  { icon: <FiBarChart2 size={24} />, title: 'Analytics', desc: 'Visualize your skincare journey with beautiful charts and insights.', color: 'var(--color-peach)' },
  { icon: <FiHeart size={24} />, title: 'Achievements', desc: 'Earn badges and track streaks as you build healthy skincare habits.', color: 'var(--color-rose)' },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FAFBFE 0%, #F0EDFF 50%, #FFF8F0 100%)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg, var(--color-lavender), var(--color-soft-pink))' }}>
            ✨
          </div>
          <span className="text-xl font-bold gradient-text">GlowCare</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm no-underline">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm no-underline">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium"
            style={{ background: 'rgba(200, 182, 255, 0.15)', color: 'var(--color-lavender-dark)', border: '1px solid rgba(200, 182, 255, 0.3)' }}>
            ✨ Your Personal Skincare Companion
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight text-balance">
            Your Skin Deserves <br />
            <span className="gradient-text">Better Care</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: '#666' }}>
            Track products, build routines, log your skin journey, and unlock achievements.
            GlowCare makes skincare management effortless and beautiful.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-4 no-underline">
              Start Your Journey <FiArrowRight />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-4 no-underline">
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Floating elements */}
        <div className="relative mt-20 max-w-4xl mx-auto">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -top-8 -left-4 text-4xl"
          >🧴</motion.div>
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
            className="absolute top-10 -right-4 text-4xl"
          >💧</motion.div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, delay: 1 }}
            className="absolute -bottom-4 left-1/4 text-3xl"
          >🌿</motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="glass-card p-8 shadow-xl"
            style={{ background: 'rgba(255,255,255,0.9)' }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { emoji: '📊', label: 'Analytics', val: 'Real-time' },
                { emoji: '🛡️', label: 'Compatibility', val: 'Auto-check' },
                { emoji: '📸', label: 'Progress', val: 'Photo diary' },
                { emoji: '🏆', label: 'Achievements', val: '12+ badges' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <span className="text-3xl">{item.emoji}</span>
                  <p className="text-sm font-bold mt-2">{item.label}</p>
                  <p className="text-xs" style={{ color: '#888' }}>{item.val}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Everything You Need</h2>
          <p style={{ color: '#666' }}>Powerful features to manage your complete skincare routine</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: `${feature.color}33`, color: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-sm" style={{ color: '#666' }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-12"
          style={{ background: 'linear-gradient(135deg, rgba(200,182,255,0.15), rgba(255,214,231,0.15))' }}
        >
          <h2 className="text-3xl font-extrabold mb-4">Ready to Glow?</h2>
          <p className="mb-8" style={{ color: '#666' }}>Join GlowCare today and transform your skincare routine.</p>
          <Link to="/register" className="btn-primary text-base px-8 py-4 no-underline">
            Create Free Account <FiArrowRight />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm" style={{ color: '#999' }}>
        <p>© 2024 GlowCare. Built with ❤️ for skincare lovers.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
