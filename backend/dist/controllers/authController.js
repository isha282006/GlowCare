"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resetPassword = exports.forgotPassword = exports.uploadProfilePicture = exports.changePassword = exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const profileController_1 = require("./profileController");
// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'Email already registered' });
            return;
        }
        const user = await User_1.default.create({ name, email, password });
        const token = user.getSignedJwtToken();
        res.status(201).json({
            success: true,
            token,
            user: (0, profileController_1.formatUserResponse)(req, user),
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.register = register;
// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Please provide email and password' });
            return;
        }
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        const token = user.getSignedJwtToken();
        res.status(200).json({
            success: true,
            token,
            user: (0, profileController_1.formatUserResponse)(req, user),
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.login = login;
// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user._id);
        res.status(200).json({
            success: true,
            user: {
                ...(0, profileController_1.formatUserResponse)(req, user),
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMe = getMe;
// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
    try {
        const { name, email, skinReport, onboardingCompleted, age, gender, skinType, skinConcerns, skinScore, skinTone, currentStreak, longestStreak, lastCompletedDate, completedDays, waterGoal, currentWaterIntake } = req.body;
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        if (name)
            user.name = name;
        if (email)
            user.email = email;
        if (skinReport)
            user.skinReport = skinReport;
        if (onboardingCompleted !== undefined)
            user.onboardingCompleted = onboardingCompleted;
        // Additional fields
        if (age !== undefined)
            user.age = age;
        if (gender !== undefined)
            user.gender = gender;
        if (skinType !== undefined)
            user.skinType = skinType;
        if (skinConcerns !== undefined)
            user.skinConcerns = skinConcerns;
        if (skinScore !== undefined)
            user.skinScore = skinScore;
        if (skinTone !== undefined)
            user.skinTone = skinTone;
        if (currentStreak !== undefined)
            user.currentStreak = currentStreak;
        if (longestStreak !== undefined)
            user.longestStreak = longestStreak;
        if (lastCompletedDate !== undefined)
            user.lastCompletedDate = lastCompletedDate;
        if (completedDays !== undefined)
            user.completedDays = completedDays;
        if (waterGoal !== undefined)
            user.waterGoal = waterGoal;
        if (currentWaterIntake !== undefined)
            user.currentWaterIntake = currentWaterIntake;
        await user.save();
        res.status(200).json({
            success: true,
            user: (0, profileController_1.formatUserResponse)(req, user),
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateProfile = updateProfile;
// @desc    Change password
// @route   PUT /api/auth/change-password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User_1.default.findById(req.user._id).select('+password');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(400).json({ success: false, message: 'Current password is incorrect' });
            return;
        }
        user.password = newPassword;
        await user.save();
        const token = user.getSignedJwtToken();
        res.status(200).json({ success: true, token, message: 'Password changed successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.changePassword = changePassword;
// @desc    Upload profile picture
// @route   PUT /api/auth/profile-picture
const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'Please upload a file' });
            return;
        }
        const user = await User_1.default.findByIdAndUpdate(req.user._id, { profilePicture: `/uploads/${req.file.filename}` }, { new: true });
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.uploadProfilePicture = uploadProfilePicture;
// @desc    Forgot password
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ success: false, message: 'No user found with that email' });
            return;
        }
        const resetToken = crypto_1.default.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Password reset token generated',
            resetToken,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.forgotPassword = forgotPassword;
// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto_1.default
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');
        const user = await User_1.default.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user) {
            res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
            return;
        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        const token = user.getSignedJwtToken();
        res.status(200).json({ success: true, token, message: 'Password reset successful' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.resetPassword = resetPassword;
// @desc    Logout user
// @route   POST /api/auth/logout
const logout = async (req, res) => {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};
exports.logout = logout;
//# sourceMappingURL=authController.js.map