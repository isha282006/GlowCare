"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyPhotos = exports.deletePhoto = exports.uploadPhoto = exports.getPhotos = void 0;
const Photo_1 = __importDefault(require("../models/Photo"));
// @desc    Get all photos
// @route   GET /api/photos
const getPhotos = async (req, res) => {
    try {
        const query = { user: req.user._id };
        if (req.query.category)
            query.category = req.query.category;
        const photos = await Photo_1.default.find(query).sort({ date: -1 });
        res.status(200).json({ success: true, data: photos });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPhotos = getPhotos;
// @desc    Upload photo
// @route   POST /api/photos
const uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'Please upload a file' });
            return;
        }
        const photo = await Photo_1.default.create({
            user: req.user._id,
            image: `/uploads/${req.file.filename}`,
            date: req.body.date || new Date(),
            category: req.body.category || 'progress',
            notes: req.body.notes || '',
        });
        res.status(201).json({ success: true, data: photo });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.uploadPhoto = uploadPhoto;
// @desc    Delete photo
// @route   DELETE /api/photos/:id
const deletePhoto = async (req, res) => {
    try {
        const photo = await Photo_1.default.findOne({ _id: req.params.id, user: req.user._id });
        if (!photo) {
            res.status(404).json({ success: false, message: 'Photo not found' });
            return;
        }
        await Photo_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Photo deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deletePhoto = deletePhoto;
// @desc    Get photos by month for comparison
// @route   GET /api/photos/monthly
const getMonthlyPhotos = async (req, res) => {
    try {
        const photos = await Photo_1.default.aggregate([
            { $match: { user: req.user._id } },
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMonthlyPhotos = getMonthlyPhotos;
//# sourceMappingURL=photoController.js.map