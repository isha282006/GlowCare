import { Response } from 'express';
import Photo from '../models/Photo';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all photos
// @route   GET /api/photos
export const getPhotos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = { user: req.user!._id };
    if (req.query.category) query.category = req.query.category;

    const photos = await Photo.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, data: photos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload photo
// @route   POST /api/photos
export const uploadPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Please upload a file' });
      return;
    }

    const photo = await Photo.create({
      user: req.user!._id,
      image: `/uploads/${req.file.filename}`,
      date: req.body.date || new Date(),
      category: req.body.category || 'progress',
      notes: req.body.notes || '',
    });

    res.status(201).json({ success: true, data: photo });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete photo
// @route   DELETE /api/photos/:id
export const deletePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const photo = await Photo.findOne({ _id: req.params.id, user: req.user!._id });
    if (!photo) {
      res.status(404).json({ success: false, message: 'Photo not found' });
      return;
    }
    await Photo.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Photo deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get photos by month for comparison
// @route   GET /api/photos/monthly
export const getMonthlyPhotos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const photos = await Photo.aggregate([
      { $match: { user: req.user!._id } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          photos: { $push: '$$ROOT' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    res.status(200).json({ success: true, data: photos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
