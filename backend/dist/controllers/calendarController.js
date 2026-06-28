"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarEvents = void 0;
const RoutineHistory_1 = __importDefault(require("../models/RoutineHistory"));
const JournalEntry_1 = __importDefault(require("../models/JournalEntry"));
const Photo_1 = __importDefault(require("../models/Photo"));
const Product_1 = __importDefault(require("../models/Product"));
const Wishlist_1 = __importDefault(require("../models/Wishlist"));
// @desc    Get calendar events for a month
// @route   GET /api/calendar
const getCalendarEvents = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = parseInt(req.query.month) || new Date().getMonth() + 1;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const userId = req.user._id;
        // Routine history
        const routineHistory = await RoutineHistory_1.default.find({
            user: userId,
            date: { $gte: startDate, $lte: endDate },
        });
        // Journal entries
        const journalEntries = await JournalEntry_1.default.find({
            user: userId,
            date: { $gte: startDate, $lte: endDate },
        });
        // Photos
        const photos = await Photo_1.default.find({
            user: userId,
            date: { $gte: startDate, $lte: endDate },
        });
        // Product expiry dates
        const expiringProducts = await Product_1.default.find({
            user: userId,
            expiryDate: { $gte: startDate, $lte: endDate },
        }).select('name expiryDate');
        // Wishlist reminders
        const wishlistReminders = await Wishlist_1.default.find({
            user: userId,
            reminderDate: { $gte: startDate, $lte: endDate },
        });
        // Build events
        const events = [];
        routineHistory.forEach((h) => {
            events.push({
                date: h.date,
                type: 'routine',
                subType: h.routineType,
                title: `${h.routineType === 'morning' ? '☀️ Morning' : '🌙 Night'} Routine`,
                detail: `${h.completionPercentage}% completed`,
                completion: h.completionPercentage,
            });
        });
        journalEntries.forEach((j) => {
            events.push({
                date: j.date,
                type: 'journal',
                title: '📝 Journal Entry',
                detail: `Mood: ${j.mood}`,
                id: j._id,
            });
        });
        photos.forEach((p) => {
            events.push({
                date: p.date,
                type: 'photo',
                title: '📸 Photo Upload',
                detail: p.category,
                id: p._id,
            });
        });
        expiringProducts.forEach((p) => {
            events.push({
                date: p.expiryDate,
                type: 'expiry',
                title: `⚠️ ${p.name} expires`,
                detail: 'Product expiry',
                id: p._id,
            });
        });
        wishlistReminders.forEach((w) => {
            if (w.reminderDate) {
                events.push({
                    date: w.reminderDate,
                    type: 'wishlist',
                    title: `💖 Wishlist: ${w.productName}`,
                    detail: `Priority: ${w.priority} | Price: $${w.price || 0}`,
                    id: w._id,
                });
            }
        });
        res.status(200).json({ success: true, data: events });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCalendarEvents = getCalendarEvents;
//# sourceMappingURL=calendarController.js.map