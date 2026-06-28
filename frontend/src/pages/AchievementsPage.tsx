import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { achievementService } from '../api/services';
import { useToast } from '../contexts/ToastContext';
import { LoadingSkeleton } from '../components/ui';
import type { Achievement } from '../types';

const AchievementsPage: React.FC = () => {
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
    <div className="page-container relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 text-left">
        <div>
          <h1 className="page-title flex items-center gap-2">
            Habit Achievements 🏆
          </h1>
          <p className="page-subtitle">Earn badges and build consistency in your skincare journey</p>
        </div>

        {/* Progress summary */}
        <div className="mt-4 md:mt-0 glass-card px-5 py-4 flex items-center gap-3.5 border border-white/40 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-xl shadow-sm border border-pink-100/20">
            👑
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Unlocked Badges</p>
            <p className="text-sm font-black text-gray-700">{unlockedCount} / {achievements.length} ({percentage}%)</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2.5 mb-8">
        {['all', 'unlocked', 'locked'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`px-5 py-2.5 rounded-full text-xs font-black cursor-pointer transition-all border uppercase tracking-wider ${
              filter === tab
                ? 'bg-primary border-primary text-white shadow-md'
                : 'bg-white border-pink-100/40 text-gray-400 hover:border-pink-200 hover:text-gray-650'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/20 rounded-3xl border border-pink-100 border-dashed max-w-lg mx-auto">
          <span className="text-5xl filter drop-shadow-sm">🏆</span>
          <h3 className="font-extrabold text-sm mt-3 text-gray-700">No achievements in this category</h3>
          <p className="text-xs text-gray-400 mt-1 font-semibold leading-relaxed">Keep completing routines and journal tasks!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ach, idx) => {
            const progressPercent = ach.target > 0 ? Math.min(Math.round((ach.progress / ach.target) * 100), 100) : 0;
            
            return (
              <motion.div
                key={ach._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`glass-card p-6.5 relative overflow-hidden flex flex-col justify-between border shadow-sm text-left ${
                  ach.isUnlocked
                    ? 'border-pink-200/50'
                    : 'opacity-70 border-white/35'
                }`}
              >
                {/* Glow effects for unlocked */}
                {ach.isUnlocked && (
                  <div className="absolute -right-6 -top-6 w-16 h-16 rounded-full bg-pink-100/30 blur-xl pointer-events-none" />
                )}

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl filter drop-shadow-sm">{ach.icon || '🏆'}</span>
                    {ach.isUnlocked ? (
                      <span className="badge badge-safe flex items-center gap-1 font-black text-[9px] uppercase">
                        <CheckCircle2 size={10} /> Unlocked
                      </span>
                    ) : (
                      <span className="badge badge-lavender flex items-center gap-1 text-[9px] font-black uppercase opacity-70">
                        <Lock size={10} /> Locked
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-sm text-gray-800 mb-1">{ach.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-semibold mb-5">{ach.description}</p>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between items-center text-[9px] font-black text-gray-450 mb-1.5 uppercase tracking-wider">
                    <span>Progress</span>
                    <span>{ach.progress} / {ach.target}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-pink-100/35 border border-white/20 shadow-inner">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progressPercent}%`,
                        background: ach.isUnlocked
                          ? 'linear-gradient(90deg, #FF5FA2 0%, #F472B6 100%)'
                          : 'linear-gradient(90deg, #FFC7DE 0%, #FFD6E7 100%)'
                      }}
                    />
                  </div>
                </div>

                {ach.unlockedAt && (
                  <p className="text-[9px] text-gray-450 font-bold uppercase tracking-wider mt-4.5 text-right flex items-center justify-end gap-1">
                    <Sparkles size={11} className="text-primary animate-pulse" />
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
