import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, BarChart3, BookOpen, Star, Package, Heart, Sparkles } from 'lucide-react';

const features = [
  { icon: <Package size={24} />, title: 'Product Inventory', desc: 'Track all your skincare products, expiry dates, and quantities in one place.', color: '#FF5FA2' },
  { icon: <Star size={24} />, title: 'Routine Builder', desc: 'Build and track your morning and night skincare routines with drag-and-drop.', color: '#C8B6FF' },
  { icon: <BookOpen size={24} />, title: 'Skin Journal', desc: 'Log your daily skin condition, water intake, sleep, and mood.', color: '#B7E4BE' },
  { icon: <Shield size={24} />, title: 'Compatibility Check', desc: 'Automatically detect ingredient conflicts in your routine.', color: '#A0D8E8' },
  { icon: <BarChart3 size={24} />, title: 'Analytics', desc: 'Visualize your skincare journey with beautiful charts and insights.', color: '#FFCBA4' },
  { icon: <Heart size={24} />, title: 'Achievements', desc: 'Earn badges and track streaks as you build healthy skincare habits.', color: '#FF6B9D' },
];

const HeroSkincareIllustration = () => (
  <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
    {/* Animated glow background */}
    <div className="absolute w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-pink-200/55 to-purple-200/35 blur-3xl animate-[pulse-glow_4s_infinite]" />
    
    <svg width="340" height="340" viewBox="0 0 340 340" fill="none" className="relative z-10 animate-[float_6s_infinite_ease-in-out]">
      <defs>
        <linearGradient id="jarGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFC7DE" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="dropperGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE8F1" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#E8DEFF" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Skincare Face Cream Jar */}
      <rect x="50" y="180" width="120" height="90" rx="20" fill="url(#jarGrad)" stroke="#FF5FA2" strokeWidth="2.5" />
      <rect x="40" y="160" width="140" height="20" rx="10" fill="#FFF" stroke="#FF5FA2" strokeWidth="2.5" />
      <path d="M70 210H150" stroke="#FFC7DE" strokeWidth="3" strokeLinecap="round" />
      <path d="M70 225H130" stroke="#FFC7DE" strokeWidth="3" strokeLinecap="round" />
      
      {/* Sparkles on jar */}
      <path d="M142 202L144 206L149 208L144 210L142 214L140 210L135 208L140 206L142 202Z" fill="#C8B6FF" />

      {/* Serum Dropper Bottle */}
      <rect x="190" y="100" width="90" height="160" rx="28" fill="url(#dropperGrad)" stroke="#9B8FCC" strokeWidth="2.5" />
      <rect x="210" y="80" width="50" height="20" rx="6" fill="#FFF" stroke="#9B8FCC" strokeWidth="2.5" />
      {/* Dropper bulb */}
      <path d="M220 80C220 65 250 65 250 80H220Z" fill="#FFC7DE" stroke="#9B8FCC" strokeWidth="2.5" />
      {/* Pipette tube inside */}
      <line x1="235" y1="100" x2="235" y2="230" stroke="#FFF" strokeWidth="4.5" strokeLinecap="round" />
      
      {/* Floating droplets */}
      <path d="M140 100C140 105 136 109 131 109C126 109 122 105 122 100C122 92 131 84 131 84C131 84 140 92 140 100Z" fill="#FFE8F1" stroke="#FF5FA2" strokeWidth="1.5" className="animate-[float_5s_infinite_ease-in-out_delay-1000]" />
      <path d="M290 140C290 145 286 149 281 149C276 149 272 145 272 140C272 132 281 124 281 124C281 124 290 132 290 140Z" fill="#E8DEFF" stroke="#9B8FCC" strokeWidth="1.5" className="animate-[float_4s_infinite_ease-in-out_delay-2000]" />

      {/* Big Botanical Leaf */}
      <path d="M90 120C120 120 130 90 160 90C190 90 200 120 230 120C200 130 190 160 160 160C130 160 120 130 90 120Z" fill="#E8F8EB" stroke="#B7E4BE" strokeWidth="2" />
      <path d="M90 120Q160 125 230 120" stroke="#B7E4BE" strokeWidth="1.5" />
    </svg>
  </div>
);

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating Background Blobs Layer */}
      <div className="glow-bg-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
      </div>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 10 }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm"
            style={{ background: 'linear-gradient(135deg, #FF5FA2, #FFC7DE)' }}
          >
            <Sparkles className="text-white" size={18} />
          </motion.div>
          <span className="text-xl font-black gradient-text">GlowCare</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="btn-secondary text-xs px-5 py-2.5 no-underline">Sign In</Link>
          <Link to="/register" className="btn-primary text-xs px-5 py-2.5 no-underline">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-semibold"
              style={{ background: 'rgba(255, 95, 162, 0.08)', color: '#FF5FA2', border: '1px solid rgba(255, 95, 162, 0.25)' }}>
              <Sparkles size={12} /> Your Personal Skincare Companion
            </div>
            <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-6 tracking-tight text-gray-800 text-balance">
              Your Skin Deserves <br />
              <span className="gradient-text">Better Care</span>
            </h1>
            <p className="text-base sm:text-lg max-w-xl mb-10 text-gray-500 leading-relaxed">
              Track products, design routines, log daily skin progress, and check ingredient compatibility. GlowCare makes skincare management elegant, minimal, and premium.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link to="/register" className="btn-primary text-sm px-7 py-3.5 no-underline shadow-md">
                Start Your Journey <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn-secondary text-sm px-7 py-3.5 no-underline">
                Sign In
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <HeroSkincareIllustration />
          </motion.div>
        </div>

        {/* Feature stats capsules */}
        <div className="mt-20 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="glass-card p-8 shadow-xl border border-white/50"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { emoji: '📊', label: 'Analytics', val: 'Real-time track' },
                { emoji: '🛡️', label: 'Compatibility', val: 'Auto ingredient check' },
                { emoji: '📸', label: 'Progress log', val: 'Selfie timeline' },
                { emoji: '🏆', label: 'Achievements', val: '12+ unlock badges' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <span className="text-3xl filter drop-shadow-sm">{item.emoji}</span>
                  <p className="text-sm font-bold mt-3 text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.val}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-gray-800 mb-3 tracking-tight">Everything You Need</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">Powerful features designed to optimize and log your complete morning and night skincare routines.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="glass-card p-7 border border-white/40"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-sm"
                style={{ background: `${feature.color}15`, color: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-2.5 text-gray-800">{feature.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call To Action */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-12 border border-white/50 shadow-xl"
          style={{ background: 'linear-gradient(135deg, rgba(255,199,222,0.25) 0%, rgba(200,182,255,0.2) 100%)' }}
        >
          <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Ready to Glow?</h2>
          <p className="mb-8 text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">Join GlowCare today, analyze your skin compatibility, and build healthy habits.</p>
          <Link to="/register" className="btn-primary text-sm px-8 py-4 no-underline shadow-md">
            Create Free Account <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 text-xs text-gray-400 relative z-10" style={{ borderTop: '1px solid rgba(255, 199, 222, 0.25)' }}>
        <p>© 2026 GlowCare. Designed with ❤️ for healthy skin.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
