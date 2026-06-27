import { Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import JournalEntry from '../models/JournalEntry';
import RoutineHistory from '../models/RoutineHistory';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all users (admin)
// @route   GET /api/admin/users
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.role === 'admin') {
      res.status(400).json({ success: false, message: 'Cannot delete admin user' });
      return;
    }

    // Delete all user data
    await Product.deleteMany({ user: req.params.id });
    await JournalEntry.deleteMany({ user: req.params.id });
    await RoutineHistory.deleteMany({ user: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'User and all associated data deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get platform statistics (admin)
// @route   GET /api/admin/stats
export const getPlatformStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalJournals = await JournalEntry.countDocuments({});
    const totalRoutineCompletions = await RoutineHistory.countDocuments({});

    // Users registered per month
    const usersPerMonth = await User.aggregate([
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
    const activeUsers = await RoutineHistory.distinct('user', { date: { $gte: weekAgo } });

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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
