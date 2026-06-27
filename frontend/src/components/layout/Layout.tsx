import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiBox, FiSun, FiBook, FiImage, FiCalendar, FiHeart, FiBarChart2,
  FiAward, FiUser, FiSettings, FiShield, FiMenu, FiX, FiLogOut, FiMoon,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/inventory', label: 'Inventory', icon: FiBox },
  { path: '/routines', label: 'Routines', icon: FiSun },
  { path: '/journal', label: 'Journal', icon: FiBook },
  { path: '/gallery', label: 'Gallery', icon: FiImage },
  { path: '/calendar', label: 'Calendar', icon: FiCalendar },
  { path: '/wishlist', label: 'Wishlist', icon: FiHeart },
  { path: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { path: '/achievements', label: 'Achievements', icon: FiAward },
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
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 fixed h-full z-30 border-r"
        style={{
          background: isDark ? 'var(--color-dark-card)' : 'white',
          borderColor: isDark ? 'var(--color-dark-border)' : 'rgba(200, 182, 255, 0.15)',
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: isDark ? 'var(--color-dark-border)' : 'rgba(200, 182, 255, 0.15)' }}>
          <Link to="/dashboard" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, var(--color-lavender), var(--color-soft-pink))' }}>
              ✨
            </div>
            <span className="text-xl font-bold gradient-text">GlowCare</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline transition-all duration-200"
                style={{
                  background: isActive(path)
                    ? 'linear-gradient(135deg, rgba(200,182,255,0.2), rgba(255,214,231,0.2))'
                    : 'transparent',
                  color: isActive(path)
                    ? (isDark ? 'var(--color-lavender-light)' : 'var(--color-lavender-dark)')
                    : (isDark ? 'var(--color-dark-muted)' : '#666'),
                  borderLeft: isActive(path) ? '3px solid var(--color-lavender)' : '3px solid transparent',
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </div>

          {/* Admin */}
          {user?.role === 'admin' && (
            <div className="mt-6 pt-4 border-t" style={{ borderColor: isDark ? 'var(--color-dark-border)' : 'rgba(200, 182, 255, 0.15)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider px-4 mb-2"
                style={{ color: isDark ? 'var(--color-dark-muted)' : '#999' }}>Admin</p>
              <Link
                to="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline transition-all duration-200"
                style={{
                  background: isActive('/admin')
                    ? 'linear-gradient(135deg, rgba(200,182,255,0.2), rgba(255,214,231,0.2))'
                    : 'transparent',
                  color: isActive('/admin')
                    ? (isDark ? 'var(--color-lavender-light)' : 'var(--color-lavender-dark)')
                    : (isDark ? 'var(--color-dark-muted)' : '#666'),
                }}
              >
                <FiShield size={18} />
                Admin Panel
              </Link>
            </div>
          )}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t space-y-1" style={{ borderColor: isDark ? 'var(--color-dark-border)' : 'rgba(200, 182, 255, 0.15)' }}>
          <Link to="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline transition-all"
            style={{ color: isDark ? 'var(--color-dark-muted)' : '#666' }}>
            <FiUser size={18} /> Profile
          </Link>
          <Link to="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline transition-all"
            style={{ color: isDark ? 'var(--color-dark-muted)' : '#666' }}>
            <FiSettings size={18} /> Settings
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left border-none cursor-pointer transition-all"
            style={{ background: 'transparent', color: isDark ? '#FF8888' : '#E74C3C' }}>
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass border-b px-4 py-3 flex items-center justify-between"
        style={{ borderColor: isDark ? 'var(--color-dark-border)' : 'rgba(200, 182, 255, 0.15)' }}>
        <Link to="/dashboard" className="flex items-center gap-2 no-underline">
          <span className="text-xl">✨</span>
          <span className="text-lg font-bold gradient-text">GlowCare</span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-xl border-none cursor-pointer"
            style={{ background: isDark ? 'var(--color-dark-card)' : 'rgba(200, 182, 255, 0.15)', color: isDark ? 'var(--color-dark-text)' : '#666' }}>
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl border-none cursor-pointer"
            style={{ background: isDark ? 'var(--color-dark-card)' : 'rgba(200, 182, 255, 0.15)', color: isDark ? 'var(--color-dark-text)' : '#666' }}>
            <FiMenu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-72 z-50 lg:hidden flex flex-col border-r"
              style={{
                background: isDark ? 'var(--color-dark-card)' : 'white',
                borderColor: isDark ? 'var(--color-dark-border)' : 'rgba(200, 182, 255, 0.15)',
              }}
            >
              <div className="p-4 flex items-center justify-between border-b"
                style={{ borderColor: isDark ? 'var(--color-dark-border)' : 'rgba(200, 182, 255, 0.15)' }}>
                <span className="text-lg font-bold gradient-text flex items-center gap-2">✨ GlowCare</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl border-none cursor-pointer"
                  style={{ background: 'transparent', color: isDark ? 'var(--color-dark-text)' : '#666' }}>
                  <FiX size={20} />
                </button>
              </div>
              <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-1">
                  {navItems.map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline transition-all"
                      style={{
                        background: isActive(path) ? 'linear-gradient(135deg, rgba(200,182,255,0.2), rgba(255,214,231,0.2))' : 'transparent',
                        color: isActive(path) ? (isDark ? 'var(--color-lavender-light)' : 'var(--color-lavender-dark)') : (isDark ? 'var(--color-dark-muted)' : '#666'),
                      }}
                    >
                      <Icon size={18} />{label}
                    </Link>
                  ))}
                </div>
                {user?.role === 'admin' && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: isDark ? 'var(--color-dark-border)' : 'rgba(200, 182, 255, 0.15)' }}>
                    <Link to="/admin" onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline"
                      style={{ color: isDark ? 'var(--color-dark-muted)' : '#666' }}>
                      <FiShield size={18} /> Admin Panel
                    </Link>
                  </div>
                )}
              </nav>
              <div className="p-4 border-t space-y-1" style={{ borderColor: isDark ? 'var(--color-dark-border)' : 'rgba(200, 182, 255, 0.15)' }}>
                <Link to="/profile" onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm no-underline"
                  style={{ color: isDark ? 'var(--color-dark-muted)' : '#666' }}>
                  <FiUser size={18} /> Profile
                </Link>
                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm w-full text-left border-none cursor-pointer"
                  style={{ background: 'transparent', color: '#E74C3C' }}>
                  <FiLogOut size={18} /> Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
