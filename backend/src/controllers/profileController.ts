import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Helper to construct absolute URL
const getAbsoluteUrl = (req: any, pathUrl: string | undefined): string => {
  if (!pathUrl) return '';
  if (pathUrl.startsWith('http')) return pathUrl;
  const host = req.get('host');
  // Use https if deployed on Render or proxy header says so
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  return `${protocol}://${host}${pathUrl.startsWith('/') ? '' : '/'}${pathUrl}`;
};

// Helper to format User object with absolute URLs
const formatUserResponse = (req: any, user: any) => {
  if (!user) return null;
  
  // Format skinReport selfieImage if exists
  let formattedReport = user.skinReport;
  if (formattedReport && typeof formattedReport === 'object') {
    formattedReport = { ...formattedReport };
    if (formattedReport.selfieImage) {
      formattedReport.selfieImage = getAbsoluteUrl(req, formattedReport.selfieImage);
    }
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePhoto: getAbsoluteUrl(req, user.profilePhoto),
    profilePicture: getAbsoluteUrl(req, user.profilePicture),
    progressPhotos: (user.progressPhotos || []).map((p: string) => getAbsoluteUrl(req, p)),
    onboardingCompleted: user.onboardingCompleted,
    skinReport: formattedReport,
    
    // Additional fields
    age: user.age,
    gender: user.gender,
    skinType: user.skinType,
    skinConcerns: user.skinConcerns,
    skinScore: user.skinScore,
    skinTone: user.skinTone,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastCompletedDate: user.lastCompletedDate,
    completedDays: user.completedDays,
    waterGoal: user.waterGoal,
    currentWaterIntake: user.currentWaterIntake
  };
};

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
      imageUrl: getAbsoluteUrl(req, imageUrl),
      user: formatUserResponse(req, user)
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
      user: formatUserResponse(req, user)
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
      user: formatUserResponse(req, user)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export { getAbsoluteUrl, formatUserResponse };
