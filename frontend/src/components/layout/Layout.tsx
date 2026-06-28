import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Package, Sun, Book, Image, Heart, BarChart3,
  Award, User, Settings, Shield, Menu, X, LogOut, SunDim, Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/routines', label: 'Routines', icon: Sun },
  { path: '/journal', label: 'Journal', icon: Book },
  { path: '/gallery', label: 'Gallery', icon: Image },
  { path: '/wishlist', label: 'Wishlist', icon: Heart },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/achievements', label: 'Achievements', icon: Award },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="flex min-h-screen relative">
      {/* Floating Background Blobs Layer */}
      <div className="glow-bg-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 fixed h-full z-30 border-r backdrop-blur-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.45)',
          borderColor: 'rgba(255, 199, 222, 0.35)',
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(255, 199, 222, 0.35)' }}>
          <Link to="/dashboard" className="flex items-center gap-3 no-underline">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.05 }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-md"
              style={{ background: 'linear-gradient(135deg, #FF5FA2, #FFC7DE)' }}
            >
              <Sparkles size={18} className="text-white" />
            </motion.div>
            <span className="text-xl font-black gradient-text">GlowCare</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 overflow-y-auto space-y-1.5">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-3.5 px-4.5 py-3 rounded-2xl text-sm font-semibold no-underline transition-all relative overflow-hidden group"
                style={{
                  color: active ? '#FF5FA2' : '#5C5C5C',
                }}
              >
                {/* Active pill background */}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-pink-100/60 to-pink-50/40 border-l-[3.5px] border-primary z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                
                <span className="relative z-10 flex items-center gap-3.5 w-full">
                  <Icon 
                    size={18} 
                    className={`transition-colors duration-200 ${
                      active ? 'text-primary' : 'text-gray-400 group-hover:text-primary-dark'
                    }`} 
                  />
                  <span className="group-hover:translate-x-0.5 transition-transform duration-200">{label}</span>
                </span>
              </Link>
            );
          })}

          {/* Admin Panel Link */}
          {user?.role === 'admin' && (
            <div className="mt-6 pt-4 border-t" style={{ borderColor: 'rgba(255, 199, 222, 0.35)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider px-4 mb-2.5 text-gray-400">Admin Area</p>
              <Link
                to="/admin"
                className="flex items-center gap-3.5 px-4.5 py-3 rounded-2xl text-sm font-semibold no-underline transition-all relative group"
                style={{
                  color: isActive('/admin') ? '#FF5FA2' : '#5C5C5C',
                }}
              >
                {isActive('/admin') && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-pink-100/60 to-pink-50/40 border-l-[3.5px] border-primary z-0"
                  />
                )}
                <span className="relative z-10 flex items-center gap-3.5 w-full">
                  <Shield 
                    size={18} 
                    className={isActive('/admin') ? 'text-primary' : 'text-gray-400 group-hover:text-primary-dark'} 
                  />
                  <span className="group-hover:translate-x-0.5 transition-transform duration-200">Admin Panel</span>
                </span>
              </Link>
            </div>
          )}
        </nav>

        {/* User profile summary block */}
        <div className="p-4 border-t space-y-1" style={{ borderColor: 'rgba(255, 199, 222, 0.35)' }}>
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold w-full border-none cursor-pointer hover:bg-pink-100/30 transition-all text-gray-600 mb-2 bg-white/40"
          >
            <span className="flex items-center gap-2">
              {isDark ? <SunDim size={15} className="text-primary" /> : <Sparkles size={15} className="text-primary" />}
              <span>Theme: {isDark ? 'Rose Gold' : 'Blush'}</span>
            </span>
            <span className="text-[9px] bg-pink-100 text-primary px-1.5 py-0.5 rounded-md uppercase font-black">Light Only</span>
          </button>

          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold no-underline transition-all text-gray-600 hover:bg-pink-100/30"
          >
            <User size={16} className="text-gray-400" />
            <span>Profile Settings</span>
          </Link>
          
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold no-underline transition-all text-gray-600 hover:bg-pink-100/30"
          >
            <Settings size={16} className="text-gray-400" />
            <span>App Preferences</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold w-full text-left border-none cursor-pointer transition-all hover:bg-red-50 text-red-500 bg-transparent mt-1"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>

          {/* User profile capsule */}
          <div className="mt-4 pt-3 flex items-center gap-3 border-t border-pink-100/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white text-xs border border-white shadow-sm uppercase">
              {user?.name?.slice(0, 2) || 'GC'}
            </div>
            <div className="text-left min-w-0 flex-1">
              <p className="text-xs font-black text-gray-800 truncate leading-tight">{user?.name || 'Skincare Lover'}</p>
              <p className="text-[9px] text-gray-400 truncate">{user?.email || 'user@glowcare.com'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 px-5 py-3.5 flex items-center justify-between backdrop-blur-xl border-b"
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          borderColor: 'rgba(255, 199, 222, 0.35)',
        }}
      >
        <Link to="/dashboard" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-tr from-primary to-secondary">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-base font-black gradient-text">GlowCare</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl border-none cursor-pointer flex items-center justify-center hover:bg-pink-50 bg-white/40 text-gray-500"
          >
            {isDark ? <SunDim size={16} className="text-primary" /> : <Sparkles size={16} className="text-primary" />}
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 rounded-xl border-none cursor-pointer flex items-center justify-center hover:bg-pink-50 bg-white/40 text-gray-600"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/15 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="fixed left-0 top-0 h-full w-72 z-50 lg:hidden flex flex-col border-r backdrop-blur-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                borderColor: 'rgba(255, 199, 222, 0.35)',
              }}
            >
              <div className="p-5 flex items-center justify-between border-b"
                style={{ borderColor: 'rgba(255, 199, 222, 0.35)' }}>
                <span className="text-base font-black gradient-text flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" /> GlowCare
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 rounded-full border-none flex items-center justify-center cursor-pointer bg-white/50 text-gray-400"
                >
                  <X size={16} />
                </button>
              </div>

              <nav className="flex-1 p-4 overflow-y-auto space-y-1">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3.5 px-4.5 py-3 rounded-2xl text-sm font-semibold no-underline transition-all relative"
                    style={{
                      color: isActive(path) ? '#FF5FA2' : '#5C5C5C',
                    }}
                  >
                    {isActive(path) && (
                      <div className="absolute inset-0 bg-pink-100/50 border-l-[3.5px] border-primary rounded-2xl z-0" />
                    )}
                    <span className="relative z-10 flex items-center gap-3.5">
                      <Icon 
                        size={18} 
                        className={isActive(path) ? 'text-primary' : 'text-gray-400'} 
                      />
                      <span>{label}</span>
                    </span>
                  </Link>
                ))}

                {user?.role === 'admin' && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255, 199, 222, 0.35)' }}>
                    <Link
                      to="/admin"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3.5 px-4.5 py-3 rounded-2xl text-sm font-semibold no-underline transition-all relative"
                      style={{
                        color: isActive('/admin') ? '#FF5FA2' : '#5C5C5C',
                      }}
                    >
                      {isActive('/admin') && (
                        <div className="absolute inset-0 bg-pink-100/50 border-l-[3.5px] border-primary rounded-2xl z-0" />
                      )}
                      <span className="relative z-10 flex items-center gap-3.5">
                        <Shield 
                          size={18} 
                          className={isActive('/admin') ? 'text-primary' : 'text-gray-400'} 
                        />
                        <span>Admin Panel</span>
                      </span>
                    </Link>
                  </div>
                )}
              </nav>

              <div className="p-4 border-t space-y-1.5" style={{ borderColor: 'rgba(255, 199, 222, 0.35)' }}>
                <Link
                  to="/profile"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold no-underline text-gray-600"
                >
                  <User size={16} className="text-gray-400" />
                  <span>Profile Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold w-full text-left border-none cursor-pointer text-red-500 bg-transparent"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen pt-16 lg:pt-0 relative z-10">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
