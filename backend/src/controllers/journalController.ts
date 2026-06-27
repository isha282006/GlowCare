import { Response } from 'express';
import JournalEntry from '../models/JournalEntry';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all journal entries
// @route   GET /api/journal
export const getJournalEntries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = { user: req.user!._id };

    if (req.query.mood) query.mood = req.query.mood;
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    const total = await JournalEntry.countDocuments(query);
    const entries = await JournalEntry.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: entries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single journal entry
// @route   GET /api/journal/:id
export const getJournalEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.user!._id });
    if (!entry) {
      res.status(404).json({ success: false, message: 'Journal entry not found' });
      return;
    }
    res.status(200).json({ success: true, data: entry });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create journal entry
// @route   POST /api/journal
export const createJournalEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    req.body.user = req.user!._id;
    if (req.file) {
      req.body.progressPhoto = `/uploads/${req.file.filename}`;
    }
    if (typeof req.body.skinConcern === 'string') {
      req.body.skinConcern = req.body.skinConcern.split(',').map((s: string) => s.trim());
    }

    const entry = await JournalEntry.create(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update journal entry
// @route   PUT /api/journal/:id
export const updateJournalEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let entry = await JournalEntry.findOne({ _id: req.params.id, user: req.user!._id });
    if (!entry) {
      res.status(404).json({ success: false, message: 'Journal entry not found' });
      return;
    }

    if (req.file) {
      req.body.progressPhoto = `/uploads/${req.file.filename}`;
    }
    if (typeof req.body.skinConcern === 'string') {
      req.body.skinConcern = req.body.skinConcern.split(',').map((s: string) => s.trim());
    }

    entry = await JournalEntry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: entry });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete journal entry
// @route   DELETE /api/journal/:id
export const deleteJournalEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.user!._id });
    if (!entry) {
      res.status(404).json({ success: false, message: 'Journal entry not found' });
      return;
    }
    await JournalEntry.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Journal entry deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
