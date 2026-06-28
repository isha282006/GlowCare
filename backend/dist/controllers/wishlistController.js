"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveToInventory = exports.deleteWishlistItem = exports.updateWishlistItem = exports.addToWishlist = exports.getWishlist = void 0;
const Wishlist_1 = __importDefault(require("../models/Wishlist"));
const Product_1 = __importDefault(require("../models/Product"));
// @desc    Get all wishlist items
// @route   GET /api/wishlist
const getWishlist = async (req, res) => {
    try {
        const items = await Wishlist_1.default.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: items });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getWishlist = getWishlist;
// @desc    Add to wishlist
// @route   POST /api/wishlist
const addToWishlist = async (req, res) => {
    try {
        req.body.user = req.user._id;
        const item = await Wishlist_1.default.create(req.body);
        res.status(201).json({ success: true, data: item });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addToWishlist = addToWishlist;
// @desc    Update wishlist item
// @route   PUT /api/wishlist/:id
const updateWishlistItem = async (req, res) => {
    try {
        const item = await Wishlist_1.default.findOne({ _id: req.params.id, user: req.user._id });
        if (!item) {
            res.status(404).json({ success: false, message: 'Wishlist item not found' });
            return;
        }
        const updated = await Wishlist_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateWishlistItem = updateWishlistItem;
// @desc    Delete wishlist item
// @route   DELETE /api/wishlist/:id
const deleteWishlistItem = async (req, res) => {
    try {
        const item = await Wishlist_1.default.findOne({ _id: req.params.id, user: req.user._id });
        if (!item) {
            res.status(404).json({ success: false, message: 'Wishlist item not found' });
            return;
        }
        await Wishlist_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Wishlist item deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteWishlistItem = deleteWishlistItem;
// @desc    Move wishlist item to inventory
// @route   POST /api/wishlist/:id/move-to-inventory
const moveToInventory = async (req, res) => {
    try {
        const item = await Wishlist_1.default.findOne({ _id: req.params.id, user: req.user._id });
        if (!item) {
            res.status(404).json({ success: false, message: 'Wishlist item not found' });
            return;
        }
        const product = await Product_1.default.create({
            user: req.user._id,
            name: item.productName,
            brand: item.brand || 'Unknown',
            category: item.category || 'Other',
            quantity: 100,
            purchaseDate: new Date(),
            price: item.price || 0,
            notes: item.notes,
        });
        await Wishlist_1.default.findByIdAndDelete(req.params.id);
        res.status(201).json({
            success: true,
            data: product,
            message: 'Item moved to inventory',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.moveToInventory = moveToInventory;
//# sourceMappingURL=wishlistController.js.map