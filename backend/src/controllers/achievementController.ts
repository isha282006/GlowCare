import { Response } from 'express';
import Achievement from '../models/Achievement';
import RoutineHistory from '../models/RoutineHistory';
import JournalEntry from '../models/JournalEntry';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

const ACHIEVEMENT_DEFINITIONS = [
  { type: 'streak_7', title: '7 Day Streak', description: 'Complete routines for 7 consecutive days', icon: '🔥', target: 7 },
  { type: 'streak_30', title: '30 Day Streak', description: 'Complete routines for 30 consecutive days', icon: '💪', target: 30 },
  { type: 'first_journal', title: 'First Journal', description: 'Write your first skin journal entry', icon: '📝', target: 1 },
  { type: 'routines_50', title: '50 Completed Routines', description: 'Complete 50 routine sessions', icon: '⭐', target: 50 },
  { type: 'inventory_master', title: 'Inventory Master', description: 'Add 20 products to your inventory', icon: '🧴', target: 20 },
  { type: 'skincare_expert', title: 'Skincare Expert', description: 'Log 100 journal entries', icon: '👑', target: 100 },
  { type: 'consistency_king', title: 'Consistency King', description: 'Complete both morning and night routines for 14 days', icon: '🏆', target: 14 },
  { type: 'hydration_hero', title: 'Hydration Hero', description: 'Log 8+ glasses of water for 7 days', icon: '💧', target: 7 },
  { type: 'early_bird', title: 'Early Bird', description: 'Complete 30 morning routines', icon: '🌅', target: 30 },
  { type: 'night_owl', title: 'Night Owl', description: 'Complete 30 night routines', icon: '🌙', target: 30 },
  { type: 'photo_diary', title: 'Photo Diary', description: 'Upload 10 progress photos', icon: '📸', target: 10 },
  { type: 'well_rested', title: 'Well Rested', description: 'Log 7+ hours sleep for 7 days', icon: '😴', target: 7 },
];

// @desc    Get user achievements
// @route   GET /api/achievements
export const getAchievements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let achievements = await Achievement.find({ user: req.user!._id });

    // Initialize achievements if not exist
    if (achievements.length === 0) {
      const newAchievements = ACHIEVEMENT_DEFINITIONS.map((def) => ({
        user: req.user!._id,
        ...def,
      }));
      achievements = await Achievement.insertMany(newAchievements);
    }

    res.status(200).json({ success: true, data: achievements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check and update achievements
// @route   POST /api/achievements/check
export const checkAchievements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;

    let achievements = await Achievement.find({ user: userId });
    if (achievements.length === 0) {
      const newAchievements = ACHIEVEMENT_DEFINITIONS.map((def) => ({
        user: userId,
        ...def,
      }));
      achievements = await Achievement.insertMany(newAchievements);
    }

    // Calculate progress for each achievement
    const routineHistoryCount = await RoutineHistory.countDocuments({
      user: userId,
      completionPercentage: { $gt: 0 },
    });

    const morningRoutines = await RoutineHistory.countDocuments({
      user: userId,
      routineType: 'morning',
      completionPercentage: { $gte: 100 },
    });

    const nightRoutines = await RoutineHistory.countDocuments({
      user: userId,
      routineType: 'night',
      completionPercentage: { $gte: 100 },
    });

    const journalCount = await JournalEntry.countDocuments({ user: userId });
    const productCount = await Product.countDocuments({ user: userId });

    // Calculate streaks
    const history = await RoutineHistory.find({ user: userId }).sort({ date: -1 });
    const uniqueDates = [...new Set(
      history.filter((h) => h.completionPercentage > 0)
        .map((h) => h.date.toISOString().split('T')[0])
    )].sort().reverse();

    let currentStreak = 0;
    for (let i = 0; i < uniqueDates.length; i++) {
      const expected = new Date();
      expected.setDate(expected.getDate() - i);
      if (uniqueDates[i] === expected.toISOString().split('T')[0]) {
        currentStreak++;
      } else break;
    }

    // Hydration days
    const hydrationDays = await JournalEntry.countDocuments({
      user: userId,
      waterIntake: { $gte: 8 },
    });

    // Sleep days
    const sleepDays = await JournalEntry.countDocuments({
      user: userId,
      sleepHours: { $gte: 7 },
    });

    // Both routines days
    const bothRoutineDays = await RoutineHistory.aggregate([
      { $match: { user: userId, completionPercentage: 100 } },
      { $group: { _id: { date: '$date' }, types: { $addToSet: '$routineType' } } },
      { $match: { 'types.1': { $exists: true } } },
    ]);

    const progressMap: Record<string, number> = {
      streak_7: currentStreak,
      streak_30: currentStreak,
      first_journal: journalCount,
      routines_50: routineHistoryCount,
      inventory_master: productCount,
      skincare_expert: journalCount,
      consistency_king: bothRoutineDays.length,
      hydration_hero: hydrationDays,
      early_bird: morningRoutines,
      night_owl: nightRoutines,
      photo_diary: 0,
      well_rested: sleepDays,
    };

    // Update all achievements
    for (const achievement of achievements) {
      const progress = progressMap[achievement.type] || 0;
      const isUnlocked = progress >= achievement.target;

      await Achievement.findByIdAndUpdate(achievement._id, {
        progress: Math.min(progress, achievement.target),
        isUnlocked,
        unlockedAt: isUnlocked && !achievement.isUnlocked ? new Date() : achievement.unlockedAt,
      });
    }

    const updated = await Achievement.find({ user: userId });
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
