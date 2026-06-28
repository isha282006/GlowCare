import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Sparkles } from 'lucide-react';
import { analyticsService, journalService, achievementService, photoService } from '../api/services';
import { useToast } from '../contexts/ToastContext';
import { LoadingSkeleton, StatCard, EmptyState } from '../components/ui';
import type { JournalStats, ProductStats, RoutineCompletionData, DashboardStats, JournalEntry, Achievement } from '../types';

const COLORS = ['#FFC7DE', '#E8DBFF', '#D8F3DC', '#CAF0F8', '#FFD6E7', '#F472B6', '#FF5FA2', '#FFCBA4'];

const AnalyticsPage: React.FC = () => {
  const { showToast } = useToast();
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [completionData, setCompletionData] = useState<RoutineCompletionData[]>([]);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [journalStats, setJournalStats] = useState<JournalStats | null>(null);
  const [journalList, setJournalList] = useState<JournalEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [photosCount, setPhotosCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, completionRes, prodRes, journalStatsRes, journalListRes, achRes, photosRes] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getRoutineCompletion(30),
        analyticsService.getProducts(),
        analyticsService.getJournal(),
        journalService.getAll({ limit: '100' }),
        achievementService.getAll(),
        photoService.getAll()
      ]);

      setDashboardStats(dashRes.data.data);
      setCompletionData(completionRes.data.data);
      setProductStats(prodRes.data.data);
      setJournalStats(journalStatsRes.data.data);
      
      // Sort journals chronologically for line charts
      if (journalListRes.data?.data) {
        const sorted = [...journalListRes.data.data].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setJournalList(sorted);
      }
      
      setAchievements(achRes.data.data || []);
      setPhotosCount(photosRes.data?.data?.length || 0);
    } catch {
      showToast('Failed to fetch analytics datasets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="page-container space-y-6 relative z-10">
        <LoadingSkeleton type="text" count={2} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton type="chart" />
          <LoadingSkeleton type="chart" />
        </div>
      </div>
    );
  }

  const hasData = (dashboardStats && (dashboardStats.totalProducts > 0 || dashboardStats.currentStreak > 0)) || 
                  (journalList && journalList.length > 0) ||
                  (completionData && completionData.length > 0);

  if (!hasData) {
    return (
      <div className="page-container relative z-10">
        <div className="mb-8 text-left">
          <h1 className="page-title">Skincare Analytics 📊</h1>
          <p className="page-subtitle">Inspect skin rating trends, water consumption, sleep tracking, and habits stats</p>
        </div>
        <EmptyState
          icon="📊"
          title="No analytics logs calculated yet"
          description="Log daily journals, build product collections, and toggle routine steps to draw graphs."
          action={<Link to="/dashboard" className="btn-primary no-underline text-xs"><Sparkles size={14} /> Go to Dashboard</Link>}
        />
      </div>
    );
  }

  // Categories split format
  const pieData = productStats?.byCategory.map((c) => ({
    name: c._id || 'Uncategorized',
    value: c.count
  })) || [];

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="page-container max-w-5xl space-y-6 relative z-10">
      <div className="mb-8 text-left">
        <h1 className="page-title flex items-center gap-2">
          Skincare Analytics 📊
        </h1>
        <p className="page-subtitle">Correlate skin health scores, hydration, sleeping patterns, and consistency streaks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon="🔥" label="Current Streak" value={`${dashboardStats?.currentStreak || 0} days`} color="var(--color-primary)" />
        <StatCard icon="🏆" label="Longest Streak" value={`${dashboardStats?.longestStreak || 0} days`} color="var(--color-accent)" />
        <StatCard icon="💧" label="Avg Water Intake" value={`${journalStats?.avgWaterIntake ? (journalStats.avgWaterIntake).toFixed(1) : 0} gl`} color="#60A5FA" />
        <StatCard icon="😴" label="Avg Sleep Hours" value={`${journalStats?.avgSleepHours ? (journalStats.avgSleepHours).toFixed(1) : 0} hrs`} color="#34D399" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
        
        {/* Routine Completion Trend */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border border-white/40 shadow-sm">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">Routine Completion Trend</h3>
          {completionData.length === 0 ? (
            <p className="text-xs text-center py-12 text-gray-400">Not enough data to display completion trend</p>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={completionData}>
                <defs>
                  <linearGradient id="completeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5FA2" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF5FA2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFEBF3" />
                <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} fontSize={9} stroke="#999" />
                <YAxis fontSize={9} stroke="#999" />
                <Tooltip contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: 18, border: '1px solid #FFEBF3', fontSize: 10, backdropFilter: 'blur(10px)' }} />
                <Area type="monotone" dataKey="average" stroke="#FF5FA2" fillOpacity={1} fill="url(#completeGrad)" name="Completion %" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Monthly Skin Score / Ratings Trend */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border border-white/40 shadow-sm">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">Daily Skin Condition Rating (1-5★)</h3>
          {journalList.length === 0 ? (
            <p className="text-xs text-center py-12 text-gray-400">Log skin ratings in your daily journal to display trends</p>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={journalList}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFEBF3" />
                <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} fontSize={9} stroke="#999" />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} fontSize={9} stroke="#999" />
                <Tooltip contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: 18, border: '1px solid #FFEBF3', fontSize: 10, backdropFilter: 'blur(10px)' }} />
                <Line type="monotone" dataKey="rating" stroke="#F472B6" name="Skin Rating" strokeWidth={2.5} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Daily Water Intake log */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border border-white/40 shadow-sm">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">Daily Water Intake (Glasses)</h3>
          {journalList.length === 0 ? (
            <p className="text-xs text-center py-12 text-gray-400">Log daily water consumption in your journal</p>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={journalList}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFEBF3" />
                <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} fontSize={9} stroke="#999" />
                <YAxis fontSize={9} stroke="#999" />
                <Tooltip contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: 18, border: '1px solid #FFEBF3', fontSize: 10, backdropFilter: 'blur(10px)' }} />
                <Bar dataKey="waterIntake" fill="#60A5FA" radius={[5, 5, 0, 0]} name="Water (Glasses)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Sleep Hours Trend */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border border-white/40 shadow-sm">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">Daily Sleep Hours</h3>
          {journalList.length === 0 ? (
            <p className="text-xs text-center py-12 text-gray-400">Log sleep durations to draw graphs</p>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={journalList}>
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34D399" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFEBF3" />
                <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} fontSize={9} stroke="#999" />
                <YAxis domain={[0, 12]} fontSize={9} stroke="#999" />
                <Tooltip contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: 18, border: '1px solid #FFEBF3', fontSize: 10, backdropFilter: 'blur(10px)' }} />
                <Area type="monotone" dataKey="sleepHours" stroke="#34D399" fillOpacity={1} fill="url(#sleepGrad)" name="Sleep (Hours)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Products Split */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border border-white/40 shadow-sm">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">Skincare Products by Category</h3>
          {pieData.length === 0 ? (
            <p className="text-xs text-center py-12 text-gray-400">No products registered in inventory</p>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-around gap-4">
              <div className="w-full md:w-1/2 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: 18, border: '1px solid #FFEBF3', fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 max-h-[160px] overflow-y-auto space-y-1.5 font-semibold text-xs">
                {pieData.map((d, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[idx % COLORS.length] }} />
                    <span className="text-gray-500 truncate">{d.name}:</span>
                    <span className="text-primary font-black">{d.value} items</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Skin concerns bar */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border border-white/40 shadow-sm">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">Symptom Concerns Frequencies</h3>
          {!journalStats?.concerns || journalStats.concerns.length === 0 ? (
            <p className="text-xs text-center py-12 text-gray-400">Log skin symptoms inside journals to list frequencies</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={journalStats.concerns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFEBF3" />
                <XAxis dataKey="name" fontSize={9} stroke="#999" />
                <YAxis fontSize={9} stroke="#999" />
                <Tooltip contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: 18, border: '1px solid #FFEBF3', fontSize: 10 }} />
                <Bar dataKey="count" fill="var(--color-secondary)" radius={[5, 5, 0, 0]} name="Mentions count" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

      </div>

      {/* Progress Photos & Achievements summary row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-2">
        {/* Achievements Card */}
        <div className="glass-card p-6 border border-white/40 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-pink-50/50 border border-pink-100 flex items-center justify-center text-3xl shadow-sm">
            👑
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-extrabold text-sm text-gray-800">Milestone Achievements</h4>
              <Link to="/achievements" className="text-[10px] text-primary hover:underline no-underline font-extrabold uppercase tracking-wider">Details</Link>
            </div>
            <p className="text-xs font-bold text-gray-800">{unlockedCount} / {achievements.length} Badges Unlocked</p>
            <p className="text-[10px] text-gray-400 mt-1 font-semibold leading-relaxed">Continue daily routines and journals consistency streaks to unlock milestones.</p>
          </div>
        </div>

        {/* Photos progress Card */}
        <div className="glass-card p-6 border border-white/40 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-pink-50/50 border border-pink-100 flex items-center justify-center text-3xl shadow-sm">
            📷
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-extrabold text-sm text-gray-800">Timeline Snapshots</h4>
              <Link to="/gallery" className="text-[10px] text-primary hover:underline no-underline font-extrabold uppercase tracking-wider">Details</Link>
            </div>
            <p className="text-xs font-bold text-gray-800">{photosCount} Photos Uploaded</p>
            <p className="text-[10px] text-gray-400 mt-1 font-semibold leading-relaxed">Track visual changes on your facial skin structure chronologically.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsPage;
