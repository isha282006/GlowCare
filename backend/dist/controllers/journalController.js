"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteJournalEntry = exports.updateJournalEntry = exports.createJournalEntry = exports.getJournalEntry = exports.getJournalEntries = void 0;
const JournalEntry_1 = __importDefault(require("../models/JournalEntry"));
// @desc    Get all journal entries
// @route   GET /api/journal
const getJournalEntries = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const query = { user: req.user._id };
        if (req.query.mood)
            query.mood = req.query.mood;
        if (req.query.startDate && req.query.endDate) {
            query.date = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate),
            };
        }
        const total = await JournalEntry_1.default.countDocuments(query);
        const entries = await JournalEntry_1.default.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            success: true,
            data: entries,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getJournalEntries = getJournalEntries;
// @desc    Get single journal entry
// @route   GET /api/journal/:id
const getJournalEntry = async (req, res) => {
    try {
        const entry = await JournalEntry_1.default.findOne({ _id: req.params.id, user: req.user._id });
        if (!entry) {
            res.status(404).json({ success: false, message: 'Journal entry not found' });
            return;
        }
        res.status(200).json({ success: true, data: entry });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getJournalEntry = getJournalEntry;
// @desc    Create journal entry
// @route   POST /api/journal
const createJournalEntry = async (req, res) => {
    try {
        req.body.user = req.user._id;
        if (req.file) {
            req.body.progressPhoto = `/uploads/${req.file.filename}`;
        }
        if (typeof req.body.skinConcern === 'string') {
            req.body.skinConcern = req.body.skinConcern.split(',').map((s) => s.trim());
        }
        const entry = await JournalEntry_1.default.create(req.body);
        res.status(201).json({ success: true, data: entry });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createJournalEntry = createJournalEntry;
// @desc    Update journal entry
// @route   PUT /api/journal/:id
const updateJournalEntry = async (req, res) => {
    try {
        let entry = await JournalEntry_1.default.findOne({ _id: req.params.id, user: req.user._id });
        if (!entry) {
            res.status(404).json({ success: false, message: 'Journal entry not found' });
            return;
        }
        if (req.file) {
            req.body.progressPhoto = `/uploads/${req.file.filename}`;
        }
        if (typeof req.body.skinConcern === 'string') {
            req.body.skinConcern = req.body.skinConcern.split(',').map((s) => s.trim());
        }
        entry = await JournalEntry_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({ success: true, data: entry });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateJournalEntry = updateJournalEntry;
// @desc    Delete journal entry
// @route   DELETE /api/journal/:id
const deleteJournalEntry = async (req, res) => {
    try {
        const entry = await JournalEntry_1.default.findOne({ _id: req.params.id, user: req.user._id });
        if (!entry) {
            res.status(404).json({ success: false, message: 'Journal entry not found' });
            return;
        }
        await JournalEntry_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Journal entry deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteJournalEntry = deleteJournalEntry;
//# sourceMappingURL=journalController.js.map