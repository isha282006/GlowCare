import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiSun, FiBook, FiImage, FiPlus, FiFileText, FiAward, FiBox, FiClock } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { analyticsService, routineService, photoService, productService } from '../api/services';
import { LoadingSkeleton } from '../components/ui';
import type { DashboardStats, WeeklyActivity, Routine } from '../types';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weekly, setWeekly] = useState<WeeklyActivity[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [latestPhoto, setLatestPhoto] = useState<string | null>(null);
  const [productsOwnedCount, setProductsOwnedCount] = useState(0);
  const [nextExpiringProduct, setNextExpiringProduct] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, weeklyRes, routinesRes, photosRes, productsRes] = await Promise.all([
          analyticsService.getDashboard(),
          analyticsService.getWeekly(),
          routineService.getAll(),
          photoService.getAll(),
          productService.getAll(),
        ]);
        
        setStats(statsRes.data.data);
        setWeekly(weeklyRes.data.data);
        setRoutines(routinesRes.data.data);
        
        if (photosRes.data?.data?.length > 0) {
          setLatestPhoto(photosRes.data.data[0].image);
        }

        if (productsRes.data?.data) {
          setProductsOwnedCount(productsRes.data.data.length);
          const activeProducts = productsRes.data.data.filter(p => p.status !== 'expired' && p.expiryDate);
          if (activeProducts.length > 0) {
            activeProducts.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
            const soonest = activeProducts[0];
            const daysLeft = Math.ceil((new Date(soonest.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            setNextExpiringProduct(`${soonest.name} (${daysLeft > 0 ? `${daysLeft} days` : 'today'})`);
          } else {
            setNextExpiringProduct('None expiring');
          }
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSkeleton type="text" count={2} />
        <div className="mt-6"><LoadingSkeleton count={4} /></div>
      </div>
    );
  }

  const morningStepsCount = routines.find(r => r.type === 'morning')?.steps.length || 0;
  const nightStepsCount = routines.find(r => r.type === 'night')?.steps.length || 0;

  // Custom quick actions list
  const quickActions = [
    { icon: <FiPlus />, label: 'Add Product', path: '/inventory/add', color: 'var(--color-lavender)' },
    { icon: <FiImage />, label: 'Upload Progress Photo', path: '/gallery', color: 'var(--color-sky)' },
    { icon: <FiBook />, label: 'Write Journal', path: '/journal', color: 'var(--color-mint)' },
    { icon: <FiFileText />, label: 'View Skin Report', path: '/skin-report', color: 'var(--color-soft-pink)' },
  ];

  return (
    <div className="page-container max-w-5xl space-y-6">
      
      {/* Top Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border border-lavender/30 relative overflow-hidden"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(26,26,46,0.8) 0%, rgba(15,15,26,0.9) 100%)'
            : 'linear-gradient(135deg, rgba(252,228,236,0.6) 0%, rgba(243,229,245,0.6) 100%)'
        }}
      >
        <div className="relative z-10 space-y-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-xs text-gray-500 mt-0.5">Welcome back to your GlowCare Skincare Management Hub.</p>
          </div>

          {/* Diagnostic overview status bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2 border-t border-lavender/10 text-xs">
            <div>
              <p className="text-gray-400 font-bold mb-1">Skin Score</p>
              <p className="text-lg font-black text-lavender-dark">{user?.skinReport?.skinScore || 'N/A'}/100</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold mb-1">Routine Progress</p>
              <p className="text-lg font-black text-lavender-dark">{stats?.routineCompletion || 0}%</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold mb-1">Current Streak</p>
              <p className="text-lg font-black text-lavender-dark">{stats?.currentStreak || 0} days</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold mb-1">Skin Type</p>
              <p className="text-lg font-black text-lavender-dark">{user?.skinReport?.skinType || 'Not Set'}</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-gray-400 font-bold mb-1">Next Expiring</p>
              <p className="text-xs font-bold text-coral truncate" title={nextExpiringProduct || 'None'}>
                {nextExpiringProduct || 'None'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* QUICK STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lavender/15 flex items-center justify-center text-lavender-dark"><FiBox size={18} /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Products Owned</p>
            <p className="text-base font-black">{productsOwnedCount}</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600"><FiSun size={18} /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Morning steps</p>
            <p className="text-base font-black">{morningStepsCount}</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><FiClock size={18} /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Night steps</p>
            <p className="text-base font-black">{nightStepsCount}</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600"><span className="text-lg">💧</span></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Water Goal</p>
            <p className="text-base font-black">{(user?.skinReport?.waterGoal || 2.0).toFixed(1)}L</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-mint-light/20 flex items-center justify-center text-mint-dark"><span className="text-lg">😴</span></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Sleep Hours</p>
            <p className="text-base font-black">{user?.skinReport?.sleepGoal || 8}h</p>
          </div>
        </div>
      </div>

      {/* PRIMARY DASHBOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left columns */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Latest progress selfie */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-1.5"><FiImage className="text-sky-dark" /> Latest Progress Photo</h3>
            {latestPhoto ? (
              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-inner relative group">
                <img src={`http://localhost:5000${latestPhoto}`} alt="Skin progress log" className="w-full h-full object-cover" />
                <Link to="/gallery" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity no-underline text-white font-bold text-xs rounded-2xl">
                  Compare Progress Side-by-Side
                </Link>
              </div>
            ) : (
              <div className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-sky flex flex-col items-center justify-center p-6 text-center">
                <span className="text-4xl mb-2">📸</span>
                <p className="font-bold text-xs">No Baseline Photo Uploaded</p>
                <p className="text-[10px] text-gray-400 mt-1 max-w-sm">Capture or upload progress snaps to visual comparison slider templates.</p>
                <Link to="/gallery" className="btn-primary py-1.5 px-4 text-xs mt-3 no-underline">Open Gallery</Link>
              </div>
            )}
          </div>

          {/* Weekly routine completion chart */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-1.5"><FiAward className="text-lavender-dark" /> Routine Completion Chart (Weekly Activity)</h3>
            {weekly.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2A2A3E' : '#f0f0f5'} />
                  <XAxis dataKey="day" stroke={isDark ? '#888' : '#999'} fontSize={10} />
                  <YAxis stroke={isDark ? '#888' : '#999'} fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      background: isDark ? '#1A1A2E' : 'white',
                      border: '1px solid var(--color-lavender)',
                      borderRadius: 12,
                      color: isDark ? '#E0E0F0' : '#1a1a2e',
                    }}
                  />
                  <Bar dataKey="routineCompletion" fill="var(--color-lavender)" radius={[8, 8, 0, 0]} name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <p className="text-xs text-gray-400">No activity data logged for this week.</p>
              </div>
            )}
          </div>

        </div>

        {/* Right column */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-sm">Quick Skincare Management Actions</h3>
            <div className="grid grid-cols-1 gap-2.5">
              {quickActions.map(({ icon, label, path, color }, i) => (
                <Link key={i} to={path} className="no-underline">
                  <motion.div
                    whileHover={{ x: 3 }}
                    className="p-3.5 rounded-2xl flex items-center gap-3 border border-transparent hover:border-lavender/25 transition-all bg-white/40 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                      style={{ background: `${color}25`, color }}>
                      {icon}
                    </div>
                    <span className="text-xs font-extrabold text-gray-700 dark:text-dark-text">{label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Journal Entry */}
          <div className="glass-card p-6 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-1.5"><FiBook className="text-mint-dark" /> Recent Journal Entry</h3>
            {stats?.recentJournal ? (
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold">{new Date(stats.recentJournal.date).toLocaleDateString()}</span>
                  <span className="badge badge-lavender text-[9px] uppercase font-extrabold">{stats.recentJournal.mood}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-center">
                  <div className="p-2 rounded-xl bg-sky/5 border border-sky/10">💧 {stats.recentJournal.waterIntake} glasses</div>
                  <div className="p-2 rounded-xl bg-mint/5 border border-mint/10">😴 {stats.recentJournal.sleepHours}h sleep</div>
                </div>

                {stats.recentJournal.notes && (
                  <p className="text-xs text-gray-500 leading-relaxed italic bg-gray-50/50 dark:bg-dark-bg p-3 rounded-xl">
                    "{stats.recentJournal.notes}"
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <span className="text-3xl">📝</span>
                <p className="text-[10px] text-gray-400">Write your daily skin symptoms to find habits correlations.</p>
                <Link to="/journal" className="btn-secondary text-[10px] inline-block no-underline py-1.5 px-3">Write Log</Link>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardPage;
