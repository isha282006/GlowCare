"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeeklyActivity = exports.getJournalStats = exports.getProductStats = exports.getRoutineCompletion = exports.getDashboardStats = void 0;
const RoutineHistory_1 = __importDefault(require("../models/RoutineHistory"));
const Product_1 = __importDefault(require("../models/Product"));
const JournalEntry_1 = __importDefault(require("../models/JournalEntry"));
// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        // Product stats
        const totalProducts = await Product_1.default.countDocuments({ user: userId });
        const expiredProducts = await Product_1.default.countDocuments({ user: userId, expiryDate: { $lte: now } });
        const expiringProducts = await Product_1.default.countDocuments({
            user: userId, expiryDate: { $gt: now, $lte: thirtyDays },
        });
        const lowProducts = await Product_1.default.countDocuments({ user: userId, quantity: { $lte: 20 } });
        // Streak calculation
        const streak = await calculateStreak(userId);
        // Recent journal
        const recentJournal = await JournalEntry_1.default.findOne({ user: userId }).sort({ date: -1 });
        // Today's routine completion
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayHistory = await RoutineHistory_1.default.find({ user: userId, date: today });
        const routineCompletion = todayHistory.length > 0
            ? Math.round(todayHistory.reduce((sum, h) => sum + h.completionPercentage, 0) / todayHistory.length)
            : 0;
        res.status(200).json({
            success: true,
            data: {
                totalProducts,
                expiredProducts,
                expiringProducts,
                lowProducts,
                currentStreak: streak.current,
                longestStreak: streak.longest,
                recentJournal,
                routineCompletion,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
// @desc    Get routine completion stats
// @route   GET /api/analytics/routine-completion
const getRoutineCompletion = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        const history = await RoutineHistory_1.default.find({
            user: req.user._id,
            date: { $gte: startDate },
        }).sort({ date: 1 });
        // Group by date
        const grouped = {};
        history.forEach((h) => {
            const dateKey = h.date.toISOString().split('T')[0];
            if (!grouped[dateKey])
                grouped[dateKey] = { morning: 0, night: 0 };
            grouped[dateKey][h.routineType] = h.completionPercentage;
        });
        const data = Object.entries(grouped).map(([date, values]) => ({
            date,
            morning: values.morning,
            night: values.night,
            average: Math.round((values.morning + values.night) / 2),
        }));
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getRoutineCompletion = getRoutineCompletion;
// @desc    Get product stats by category
// @route   GET /api/analytics/products
const getProductStats = async (req, res) => {
    try {
        const byCategory = await Product_1.default.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        const bySkinType = await Product_1.default.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: '$skinType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        const byStatus = await Product_1.default.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        res.status(200).json({
            success: true,
            data: { byCategory, bySkinType, byStatus },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProductStats = getProductStats;
// @desc    Get journal stats
// @route   GET /api/analytics/journal
const getJournalStats = async (req, res) => {
    try {
        const userId = req.user._id;
        // Entries per month
        const entriesPerMonth = await JournalEntry_1.default.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);
        // Skin concern frequency
        const concerns = await JournalEntry_1.default.aggregate([
            { $match: { user: userId } },
            { $unwind: '$skinConcern' },
            { $group: { _id: '$skinConcern', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);
        // Average water intake
        const waterStats = await JournalEntry_1.default.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, avg: { $avg: '$waterIntake' }, total: { $sum: 1 } } },
        ]);
        // Average sleep
        const sleepStats = await JournalEntry_1.default.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, avg: { $avg: '$sleepHours' } } },
        ]);
        // Mood distribution
        const moodDist = await JournalEntry_1.default.aggregate([
            { $match: { user: userId } },
            { $group: { _id: '$mood', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        res.status(200).json({
            success: true,
            data: {
                entriesPerMonth: entriesPerMonth.map((e) => ({
                    month: `${e._id.year}-${String(e._id.month).padStart(2, '0')}`,
                    count: e.count,
                })),
                concerns: concerns.map((c) => ({ name: c._id, count: c.count })),
                avgWaterIntake: waterStats[0]?.avg || 0,
                avgSleepHours: sleepStats[0]?.avg || 0,
                moodDistribution: moodDist.map((m) => ({ mood: m._id, count: m.count })),
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getJournalStats = getJournalStats;
// @desc    Get weekly activity
// @route   GET /api/analytics/weekly
const getWeeklyActivity = async (req, res) => {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        const history = await RoutineHistory_1.default.find({
            user: req.user._id,
            date: { $gte: startDate },
        }).sort({ date: 1 });
        const journals = await JournalEntry_1.default.find({
            user: req.user._id,
            date: { $gte: startDate },
        });
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayHistory = history.filter((h) => h.date.toISOString().split('T')[0] === dateStr);
            const dayJournal = journals.filter((j) => j.date.toISOString().split('T')[0] === dateStr);
            days.push({
                date: dateStr,
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                routineCompletion: dayHistory.length > 0
                    ? Math.round(dayHistory.reduce((sum, h) => sum + h.completionPercentage, 0) / dayHistory.length)
                    : 0,
                journalEntry: dayJournal.length > 0,
            });
        }
        res.status(200).json({ success: true, data: days });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getWeeklyActivity = getWeeklyActivity;
// Helper function for streak calculation
async function calculateStreak(userId) {
    const history = await RoutineHistory_1.default.find({ user: userId })
        .sort({ date: -1 })
        .select('date completionPercentage');
    if (history.length === 0)
        return { current: 0, longest: 0 };
    const uniqueDates = [...new Set(history
            .filter((h) => h.completionPercentage > 0)
            .map((h) => h.date.toISOString().split('T')[0]))
    ].sort().reverse();
    let current = 0;
    let longest = 0;
    let tempStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    // Current streak
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        for (let i = 0; i < uniqueDates.length; i++) {
            const expected = new Date();
            expected.setDate(expected.getDate() - i);
            const expectedStr = expected.toISOString().split('T')[0];
            if (uniqueDates[i] === expectedStr || (i === 0 && uniqueDates[0] === yesterday)) {
                current++;
            }
            else {
                break;
            }
        }
    }
    // Longest streak
    for (let i = 0; i < uniqueDates.length; i++) {
        if (i === 0) {
            tempStreak = 1;
        }
        else {
            const prev = new Date(uniqueDates[i - 1]);
            const curr = new Date(uniqueDates[i]);
            const diff = (prev.getTime() - curr.getTime()) / 86400000;
            if (diff === 1) {
                tempStreak++;
            }
            else {
                longest = Math.max(longest, tempStreak);
                tempStreak = 1;
            }
        }
    }
    longest = Math.max(longest, tempStreak);
    return { current, longest };
}
//# sourceMappingURL=analyticsController.js.map