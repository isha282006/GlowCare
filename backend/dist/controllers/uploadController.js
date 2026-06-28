"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProgressPhoto = exports.uploadProfilePhoto = void 0;
const User_1 = __importDefault(require("../models/User"));
const Photo_1 = __importDefault(require("../models/Photo"));
const profileController_1 = require("./profileController");
// @desc    Upload profile photo
// @route   POST /api/upload/profile-photo
const uploadProfilePhoto = async (req, res) => {
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
            imageUrl: (0, profileController_1.getAbsoluteUrl)(req, imageUrl),
            user: (0, profileController_1.formatUserResponse)(req, user)
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.uploadProfilePhoto = uploadProfilePhoto;
// @desc    Upload progress photo
// @route   POST /api/upload/progress-photo
const uploadProgressPhoto = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'Please upload a file' });
            return;
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        if (!user.progressPhotos) {
            user.progressPhotos = [];
        }
        user.progressPhotos.push(imageUrl);
        await user.save();
        const photo = await Photo_1.default.create({
            user: req.user._id,
            image: imageUrl,
            date: req.body.date || new Date(),
            category: req.body.category || 'progress',
            notes: req.body.notes || '',
        });
        res.status(201).json({
            success: true,
            imageUrl: (0, profileController_1.getAbsoluteUrl)(req, imageUrl),
            photo: {
                ...photo.toObject(),
                image: (0, profileController_1.getAbsoluteUrl)(req, photo.image)
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.uploadProgressPhoto = uploadProgressPhoto;
//# sourceMappingURL=uploadController.js.map