import { Response } from 'express';
import User from '../models/User';
import Photo from '../models/Photo';
import { AuthRequest } from '../middleware/auth';

// @desc    Upload profile photo
// @route   POST /api/upload/profile-photo
export const uploadProfilePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Please upload a file' });
      return;
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { 
        profilePhoto: imageUrl,
        profilePicture: imageUrl
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      imageUrl,
      user: {
        id: user!._id,
        name: user!.name,
        email: user!.email,
        role: user!.role,
        profilePhoto: user!.profilePhoto,
        profilePicture: user!.profilePicture,
        progressPhotos: user!.progressPhotos,
        onboardingCompleted: user!.onboardingCompleted,
        skinReport: user!.skinReport
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload progress photo
// @route   POST /api/upload/progress-photo
export const uploadProgressPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Please upload a file' });
      return;
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!user.progressPhotos) {
      user.progressPhotos = [];
    }
    user.progressPhotos.push(imageUrl);
    await user.save();

    const photo = await Photo.create({
      user: req.user!._id,
      image: imageUrl,
      date: req.body.date || new Date(),
      category: req.body.category || 'progress',
      notes: req.body.notes || '',
    });

    res.status(201).json({
      success: true,
      imageUrl,
      photo
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
