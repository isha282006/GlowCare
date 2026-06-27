"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformStats = exports.deleteUser = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const Product_1 = __importDefault(require("../models/Product"));
const JournalEntry_1 = __importDefault(require("../models/JournalEntry"));
const RoutineHistory_1 = __importDefault(require("../models/RoutineHistory"));
// @desc    Get all users (admin)
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
    try {
        const users = await User_1.default.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getUsers = getUsers;
// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        if (user.role === 'admin') {
            res.status(400).json({ success: false, message: 'Cannot delete admin user' });
            return;
        }
        // Delete all user data
        await Product_1.default.deleteMany({ user: req.params.id });
        await JournalEntry_1.default.deleteMany({ user: req.params.id });
        await RoutineHistory_1.default.deleteMany({ user: req.params.id });
        await User_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'User and all associated data deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteUser = deleteUser;
// @desc    Get platform statistics (admin)
// @route   GET /api/admin/stats
const getPlatformStats = async (req, res) => {
    try {
        const totalUsers = await User_1.default.countDocuments({});
        const totalProducts = await Product_1.default.countDocuments({});
        const totalJournals = await JournalEntry_1.default.countDocuments({});
        const totalRoutineCompletions = await RoutineHistory_1.default.countDocuments({});
        // Users registered per month
        const usersPerMonth = await User_1.default.aggregate([
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);
        // Active users (completed routine in last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const activeUsers = await RoutineHistory_1.default.distinct('user', { date: { $gte: weekAgo } });
        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalJournals,
                totalRoutineCompletions,
                activeUsersCount: activeUsers.length,
                usersPerMonth: usersPerMonth.map((u) => ({
                    month: `${u._id.year}-${String(u._id.month).padStart(2, '0')}`,
                    count: u.count,
                })),
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPlatformStats = getPlatformStats;
//# sourceMappingURL=adminController.js.map