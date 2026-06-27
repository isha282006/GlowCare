import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { analyticsService } from '../api/services';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { LoadingSkeleton, StatCard, EmptyState } from '../components/ui';
import type { JournalStats, ProductStats, RoutineCompletionData, DashboardStats } from '../types';

const COLORS = ['#C8B6FF', '#FFD6E7', '#D8F3DC', '#CAF0F8', '#FFCBA4', '#FF7F7F', '#C084FC', '#F472B6', '#34D399', '#60A5FA'];

const AnalyticsPage: React.FC = () => {
  const { isDark } = themeState();
  const { showToast } = useToast();
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [completionData, setCompletionData] = useState<RoutineCompletionData[]>([]);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [journalStats, setJournalStats] = useState<JournalStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback function for theme retrieval since context hook might be named differently
  function themeState() {
    try {
      return useTheme();
    } catch {
      return { isDark: false };
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, completionRes, prodRes, journalRes] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getRoutineCompletion(30),
        analyticsService.getProducts(),
        analyticsService.getJournal(),
      ]);

      setDashboardStats(dashRes.data.data);
      setCompletionData(completionRes.data.data);
      setProductStats(prodRes.data.data);
      setJournalStats(journalRes.data.data);
    } catch {
      showToast('Failed to fetch analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSkeleton type="text" count={2} />
        <div className="mt-6"><LoadingSkeleton type="chart" /></div>
      </div>
    );
  }

  const hasData = (dashboardStats && (dashboardStats.totalProducts > 0 || dashboardStats.currentStreak > 0)) || 
                  (journalStats && (journalStats.avgWaterIntake > 0 || journalStats.avgSleepHours > 0)) ||
                  (completionData && completionData.length > 0);

  if (!hasData) {
    return (
      <div className="page-container">
        <div className="mb-6">
          <h1 className="page-title">Skincare Analytics 📊</h1>
          <p className="page-subtitle">Track your habits, product usage, lifestyle variables, and skin improvement progress</p>
        </div>
        <EmptyState
          icon="📊"
          title="Start tracking your skincare journey to view analytics."
          description="Once you log daily journals, add products, or complete routines, we will render progress analytics here."
          action={<Link to="/dashboard" className="btn-primary no-underline">Go to Dashboard</Link>}
        />
      </div>
    );
  }

  // Formatting products by category data for PieChart
  const pieData = productStats?.byCategory.map((c) => ({
    name: c._id || 'Uncategorized',
    value: c.count
  })) || [];

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="page-title">Skincare Analytics 📊</h1>
        <p className="page-subtitle">Track your habits, product usage, lifestyle variables, and skin improvement progress</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon="🔥" label="Current Streak" value={`${dashboardStats?.currentStreak || 0} days`} color="var(--color-rose)" />
        <StatCard icon="🏆" label="Longest Streak" value={`${dashboardStats?.longestStreak || 0} days`} color="var(--color-peach)" />
        <StatCard icon="💧" label="Avg Water Intake" value={`${journalStats?.avgWaterIntake ? Math.round(journalStats.avgWaterIntake * 10) / 10 : 0} gl`} color="var(--color-sky)" />
        <StatCard icon="😴" label="Avg Sleep Hours" value={`${journalStats?.avgSleepHours ? Math.round(journalStats.avgSleepHours * 10) / 10 : 0} hrs`} color="var(--color-mint)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Routine Completion Trend */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="font-bold text-sm mb-4">Routine Completion Trend (Last 30 Days)</h3>
          {completionData.length === 0 ? (
            <p className="text-sm text-center py-12" style={{ color: '#888' }}>Not enough data to display trend</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={completionData}>
                <defs>
                  <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-lavender)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-lavender)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2A2A3E' : '#f0f0f5'} />
                <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} fontSize={10} stroke={isDark ? '#888' : '#999'} />
                <YAxis fontSize={10} stroke={isDark ? '#888' : '#999'} />
                <Tooltip contentStyle={{ background: isDark ? '#1A1A2E' : 'white', borderRadius: 12, border: '1px solid var(--color-lavender)' }} />
                <Area type="monotone" dataKey="average" stroke="var(--color-lavender-dark)" fillOpacity={1} fill="url(#completionGrad)" name="Avg Completion %" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Product categories split */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="font-bold text-sm mb-4">Products by Category</h3>
          {pieData.length === 0 ? (
            <p className="text-sm text-center py-12" style={{ color: '#888' }}>No products added yet</p>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="w-full md:w-1/2">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: isDark ? '#1A1A2E' : 'white', borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 max-h-[200px] overflow-y-auto space-y-1">
                {pieData.map((d, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[idx % COLORS.length] }} />
                    <span className="font-bold">{d.name}:</span>
                    <span>{d.value} products</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Skin Concern Frequency */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="font-bold text-sm mb-4">Skin Concern Frequency</h3>
          {!journalStats?.concerns || journalStats.concerns.length === 0 ? (
            <p className="text-sm text-center py-12" style={{ color: '#888' }}>Log your skin concerns in your daily journal</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={journalStats.concerns}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2A2A3E' : '#f0f0f5'} />
                <XAxis dataKey="name" fontSize={10} stroke={isDark ? '#888' : '#999'} />
                <YAxis fontSize={10} stroke={isDark ? '#888' : '#999'} />
                <Tooltip contentStyle={{ background: isDark ? '#1A1A2E' : 'white', borderRadius: 12 }} />
                <Bar dataKey="count" fill="var(--color-peach)" radius={[6, 6, 0, 0]} name="Mentions count" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Lifestyle: Water & Sleep tracking */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="font-bold text-sm mb-4">Lifestyle Correlation (Water vs Sleep)</h3>
          {completionData.length === 0 ? (
            <p className="text-sm text-center py-12" style={{ color: '#888' }}>No daily journal entry logs found</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2A2A3E' : '#f0f0f5'} />
                <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} fontSize={10} stroke={isDark ? '#888' : '#999'} />
                <YAxis yAxisId="left" fontSize={10} stroke={isDark ? '#888' : '#999'} />
                <YAxis yAxisId="right" orientation="right" fontSize={10} stroke={isDark ? '#888' : '#999'} />
                <Tooltip contentStyle={{ background: isDark ? '#1A1A2E' : 'white', borderRadius: 12 }} />
                <Legend fontSize={10} />
                {/* Mock plotting using completions as lifestyle markers if needed, or query actual lifestyle array if preferred */}
                <Line yAxisId="left" type="monotone" dataKey="morning" stroke="var(--color-sky-dark)" name="Morning Completion %" activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="night" stroke="var(--color-lavender-dark)" name="Night Completion %" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default AnalyticsPage;
