"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductStats = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
// @desc    Get all products for user
// @route   GET /api/products
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const query = { user: req.user._id };
        // Search
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$or = [{ name: searchRegex }, { brand: searchRegex }];
        }
        // Filter by category
        if (req.query.category) {
            query.category = req.query.category;
        }
        // Filter by status
        if (req.query.status) {
            query.status = req.query.status;
        }
        // Filter by skin type
        if (req.query.skinType) {
            query.skinType = req.query.skinType;
        }
        // Sort
        let sortObj = { createdAt: -1 };
        if (req.query.sort === 'name')
            sortObj = { name: 1 };
        if (req.query.sort === 'expiry')
            sortObj = { expiryDate: 1 };
        if (req.query.sort === 'brand')
            sortObj = { brand: 1 };
        if (req.query.sort === 'newest')
            sortObj = { createdAt: -1 };
        if (req.query.sort === 'oldest')
            sortObj = { createdAt: 1 };
        const total = await Product_1.default.countDocuments(query);
        const products = await Product_1.default.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(limit);
        // Update statuses
        const now = new Date();
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        for (const product of products) {
            let newStatus = 'active';
            if (product.expiryDate && product.expiryDate <= now)
                newStatus = 'expired';
            else if (product.expiryDate && product.expiryDate <= thirtyDays)
                newStatus = 'expiring';
            else if (product.quantity <= 20)
                newStatus = 'low';
            if (product.status !== newStatus) {
                product.status = newStatus;
                await product.save();
            }
        }
        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProducts = getProducts;
// @desc    Get single product
// @route   GET /api/products/:id
const getProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findOne({ _id: req.params.id, user: req.user._id });
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.status(200).json({ success: true, data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProduct = getProduct;
// @desc    Create product
// @route   POST /api/products
const createProduct = async (req, res) => {
    try {
        req.body.user = req.user._id;
        if (req.file) {
            req.body.image = `/uploads/${req.file.filename}`;
        }
        if (typeof req.body.ingredients === 'string') {
            req.body.ingredients = req.body.ingredients.split(',').map((i) => i.trim());
        }
        const product = await Product_1.default.create(req.body);
        res.status(201).json({ success: true, data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createProduct = createProduct;
// @desc    Update product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
    try {
        let product = await Product_1.default.findOne({ _id: req.params.id, user: req.user._id });
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        if (req.file) {
            req.body.image = `/uploads/${req.file.filename}`;
        }
        if (typeof req.body.ingredients === 'string') {
            req.body.ingredients = req.body.ingredients.split(',').map((i) => i.trim());
        }
        product = await Product_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({ success: true, data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateProduct = updateProduct;
// @desc    Delete product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findOne({ _id: req.params.id, user: req.user._id });
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        await Product_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Product deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteProduct = deleteProduct;
// @desc    Get product stats
// @route   GET /api/products/stats
const getProductStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const total = await Product_1.default.countDocuments({ user: userId });
        const expired = await Product_1.default.countDocuments({ user: userId, expiryDate: { $lte: now } });
        const expiring = await Product_1.default.countDocuments({
            user: userId,
            expiryDate: { $gt: now, $lte: thirtyDays },
        });
        const low = await Product_1.default.countDocuments({ user: userId, quantity: { $lte: 20 } });
        const byCategory = await Product_1.default.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        res.status(200).json({
            success: true,
            data: { total, expired, expiring, low, byCategory },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProductStats = getProductStats;
//# sourceMappingURL=productController.js.map