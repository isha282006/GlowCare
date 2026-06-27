import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import { achievementService } from '../api/services';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { LoadingSkeleton } from '../components/ui';
import type { Achievement } from '../types';

const AchievementsPage: React.FC = () => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Automatically trigger progress evaluation on entry
      await achievementService.check();
      const res = await achievementService.getAll();
      setAchievements(res.data.data);
    } catch {
      showToast('Failed to load achievements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = achievements.filter(a => {
    if (filter === 'unlocked') return a.isUnlocked;
    if (filter === 'locked') return !a.isUnlocked;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const percentage = achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0;

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Habit Achievements 🏆</h1>
          <p className="page-subtitle">Earn badges and build consistency in your skincare journey</p>
        </div>

        {/* Progress summary */}
        <div className="mt-4 md:mt-0 glass-card px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lavender/20 flex items-center justify-center text-xl">
            👑
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: '#888' }}>Unlocked Badges</p>
            <p className="text-sm font-extrabold">{unlockedCount} / {achievements.length} ({percentage}%)</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'unlocked', 'locked'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
              filter === tab
                ? 'btn-primary border-transparent'
                : 'btn-secondary border-gray-300 text-gray-500'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl">🏆</span>
          <h3 className="font-bold text-lg mt-3">No achievements in this category</h3>
          <p className="text-xs text-gray-500 mt-1">Keep completing routines and journal tasks!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ach, idx) => {
            const progressPercent = ach.target > 0 ? Math.min(Math.round((ach.progress / ach.target) * 100), 100) : 0;
            
            return (
              <motion.div
                key={ach._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`glass-card p-5 relative overflow-hidden flex flex-col justify-between ${
                  ach.isUnlocked
                    ? 'border-lavender-dark/40 shadow-sm'
                    : 'opacity-75 border-gray-100 dark:border-dark-border'
                }`}
              >
                {/* Glow effects for unlocked */}
                {ach.isUnlocked && (
                  <div className="absolute -right-6 -top-6 w-16 h-16 rounded-full bg-lavender/20 blur-xl pointer-events-none" />
                )}

                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-4xl">{ach.icon || '🏆'}</span>
                    {ach.isUnlocked ? (
                      <span className="badge badge-safe flex items-center gap-1">
                        <FiCheckCircle size={10} /> Unlocked
                      </span>
                    ) : (
                      <span className="badge badge-lavender flex items-center gap-1 text-[10px] opacity-70">
                        <FiLock size={10} /> Locked
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm mb-1">{ach.title}</h3>
                  <p className="text-xs text-gray-500 mb-4">{ach.description}</p>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 mb-1">
                    <span>PROGRESS</span>
                    <span>{ach.progress} / {ach.target}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? 'var(--color-dark-border)' : '#f0f0f5' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progressPercent}%`,
                        background: ach.isUnlocked
                          ? 'linear-gradient(135deg, var(--color-lavender), var(--color-soft-pink))'
                          : 'var(--color-sky-dark)'
                      }}
                    />
                  </div>
                </div>

                {ach.unlockedAt && (
                  <p className="text-[10px] text-gray-400 mt-3 text-right">
                    Earned: {new Date(ach.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;
