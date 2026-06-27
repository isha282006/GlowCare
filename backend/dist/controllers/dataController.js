"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importData = exports.exportData = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const Routine_1 = __importDefault(require("../models/Routine"));
const JournalEntry_1 = __importDefault(require("../models/JournalEntry"));
const Wishlist_1 = __importDefault(require("../models/Wishlist"));
const Photo_1 = __importDefault(require("../models/Photo"));
// @desc    Export user data as JSON
// @route   GET /api/data/export
const exportData = async (req, res) => {
    try {
        const userId = req.user._id;
        const products = await Product_1.default.find({ user: userId });
        const routines = await Routine_1.default.find({ user: userId });
        const journal = await JournalEntry_1.default.find({ user: userId });
        const wishlist = await Wishlist_1.default.find({ user: userId });
        const photos = await Photo_1.default.find({ user: userId });
        const exportData = {
            exportedAt: new Date().toISOString(),
            user: {
                name: req.user.name,
                email: req.user.email,
            },
            products,
            routines,
            journal,
            wishlist,
            photos,
        };
        res.status(200).json({ success: true, data: exportData });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.exportData = exportData;
// @desc    Import user data from JSON
// @route   POST /api/data/import
const importData = async (req, res) => {
    try {
        const userId = req.user._id;
        const { products, routines, journal, wishlist } = req.body;
        let importedCounts = { products: 0, routines: 0, journal: 0, wishlist: 0 };
        if (products && Array.isArray(products)) {
            for (const p of products) {
                delete p._id;
                p.user = userId;
                await Product_1.default.create(p);
                importedCounts.products++;
            }
        }
        if (routines && Array.isArray(routines)) {
            for (const r of routines) {
                delete r._id;
                r.user = userId;
                await Routine_1.default.create(r);
                importedCounts.routines++;
            }
        }
        if (journal && Array.isArray(journal)) {
            for (const j of journal) {
                delete j._id;
                j.user = userId;
                await JournalEntry_1.default.create(j);
                importedCounts.journal++;
            }
        }
        if (wishlist && Array.isArray(wishlist)) {
            for (const w of wishlist) {
                delete w._id;
                w.user = userId;
                await Wishlist_1.default.create(w);
                importedCounts.wishlist++;
            }
        }
        res.status(200).json({
            success: true,
            message: 'Data imported successfully',
            data: importedCounts,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.importData = importData;
//# sourceMappingURL=dataController.js.map