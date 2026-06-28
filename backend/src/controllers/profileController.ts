import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// @desc    Upload / Update profile photo
// @route   POST /api/profile/upload-photo or PUT /api/profile/update-photo
export const uploadOrUpdateProfilePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
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
      message: 'Upload Successful',
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
    res.status(500).json({ success: false, message: error.message || 'Upload Failed' });
  }
};

// @desc    Remove profile photo
// @route   DELETE /api/profile/remove-photo
export const removeProfilePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { 
        profilePhoto: '',
        profilePicture: ''
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Image Removed',
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

// @desc    Get current user profile
// @route   GET /api/profile/me
export const getProfileMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        profilePicture: user.profilePicture,
        progressPhotos: user.progressPhotos,
        onboardingCompleted: user.onboardingCompleted,
        skinReport: user.skinReport
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
