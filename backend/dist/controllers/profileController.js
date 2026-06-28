"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfileMe = exports.removeProfilePhoto = exports.uploadOrUpdateProfilePhoto = void 0;
const User_1 = __importDefault(require("../models/User"));
// @desc    Upload / Update profile photo
// @route   POST /api/profile/upload-photo or PUT /api/profile/update-photo
const uploadOrUpdateProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'Please upload a file' });
            return;
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        const user = await User_1.default.findByIdAndUpdate(req.user._id, {
            profilePhoto: imageUrl,
            profilePicture: imageUrl
        }, { new: true });
        res.status(200).json({
            success: true,
            message: 'Upload Successful',
            imageUrl,
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Upload Failed' });
    }
};
exports.uploadOrUpdateProfilePhoto = uploadOrUpdateProfilePhoto;
// @desc    Remove profile photo
// @route   DELETE /api/profile/remove-photo
const removeProfilePhoto = async (req, res) => {
    try {
        const user = await User_1.default.findByIdAndUpdate(req.user._id, {
            profilePhoto: '',
            profilePicture: ''
        }, { new: true });
        res.status(200).json({
            success: true,
            message: 'Image Removed',
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.removeProfilePhoto = removeProfilePhoto;
// @desc    Get current user profile
// @route   GET /api/profile/me
const getProfileMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user._id);
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProfileMe = getProfileMe;
//# sourceMappingURL=profileController.js.map