import { Response } from 'express';
import RoutineHistory from '../models/RoutineHistory';
import JournalEntry from '../models/JournalEntry';
import Photo from '../models/Photo';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

// @desc    Get calendar events for a month
// @route   GET /api/calendar
export const getCalendarEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const userId = req.user!._id;

    // Routine history
    const routineHistory = await RoutineHistory.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    });

    // Journal entries
    const journalEntries = await JournalEntry.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    });

    // Photos
    const photos = await Photo.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    });

    // Product expiry dates
    const expiringProducts = await Product.find({
      user: userId,
      expiryDate: { $gte: startDate, $lte: endDate },
    }).select('name expiryDate');

    // Build events
    const events: any[] = [];

    routineHistory.forEach((h) => {
      events.push({
        date: h.date,
        type: 'routine',
        subType: h.routineType,
        title: `${h.routineType === 'morning' ? '☀️ Morning' : '🌙 Night'} Routine`,
        detail: `${h.completionPercentage}% completed`,
        completion: h.completionPercentage,
      });
    });

    journalEntries.forEach((j) => {
      events.push({
        date: j.date,
        type: 'journal',
        title: '📝 Journal Entry',
        detail: `Mood: ${j.mood}`,
        id: j._id,
      });
    });

    photos.forEach((p) => {
      events.push({
        date: p.date,
        type: 'photo',
        title: '📸 Photo Upload',
        detail: p.category,
        id: p._id,
      });
    });

    expiringProducts.forEach((p) => {
      events.push({
        date: p.expiryDate,
        type: 'expiry',
        title: `⚠️ ${p.name} expires`,
        detail: 'Product expiry',
        id: p._id,
      });
    });

    res.status(200).json({ success: true, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
