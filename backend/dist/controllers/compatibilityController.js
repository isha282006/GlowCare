"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCompatibility = exports.deleteRule = exports.updateRule = exports.createRule = exports.getRules = void 0;
const CompatibilityRule_1 = __importDefault(require("../models/CompatibilityRule"));
// @desc    Get all compatibility rules
// @route   GET /api/compatibility
const getRules = async (req, res) => {
    try {
        const rules = await CompatibilityRule_1.default.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: rules });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getRules = getRules;
// @desc    Create compatibility rule (admin)
// @route   POST /api/compatibility
const createRule = async (req, res) => {
    try {
        const { ingredientA, ingredientB, status, warningMessage } = req.body;
        const existing = await CompatibilityRule_1.default.findOne({
            $or: [
                { ingredientA: ingredientA, ingredientB: ingredientB },
                { ingredientA: ingredientB, ingredientB: ingredientA },
            ],
        });
        if (existing) {
            res.status(400).json({ success: false, message: 'Rule already exists for these ingredients' });
            return;
        }
        const rule = await CompatibilityRule_1.default.create({ ingredientA, ingredientB, status, warningMessage });
        res.status(201).json({ success: true, data: rule });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createRule = createRule;
// @desc    Update compatibility rule (admin)
// @route   PUT /api/compatibility/:id
const updateRule = async (req, res) => {
    try {
        const rule = await CompatibilityRule_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!rule) {
            res.status(404).json({ success: false, message: 'Rule not found' });
            return;
        }
        res.status(200).json({ success: true, data: rule });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateRule = updateRule;
// @desc    Delete compatibility rule (admin)
// @route   DELETE /api/compatibility/:id
const deleteRule = async (req, res) => {
    try {
        const rule = await CompatibilityRule_1.default.findByIdAndDelete(req.params.id);
        if (!rule) {
            res.status(404).json({ success: false, message: 'Rule not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Rule deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteRule = deleteRule;
// @desc    Check ingredient compatibility
// @route   POST /api/compatibility/check
const checkCompatibility = async (req, res) => {
    try {
        const { ingredients } = req.body;
        if (!ingredients || !Array.isArray(ingredients) || ingredients.length < 2) {
            res.status(400).json({ success: false, message: 'Please provide at least 2 ingredients' });
            return;
        }
        const warnings = [];
        const rules = await CompatibilityRule_1.default.find({});
        for (const rule of rules) {
            const hasA = ingredients.some((ing) => ing.toLowerCase().includes(rule.ingredientA.toLowerCase()) ||
                rule.ingredientA.toLowerCase().includes(ing.toLowerCase()));
            const hasB = ingredients.some((ing) => ing.toLowerCase().includes(rule.ingredientB.toLowerCase()) ||
                rule.ingredientB.toLowerCase().includes(ing.toLowerCase()));
            if (hasA && hasB) {
                warnings.push({
                    ingredientA: rule.ingredientA,
                    ingredientB: rule.ingredientB,
                    status: rule.status,
                    warningMessage: rule.warningMessage,
                });
            }
        }
        res.status(200).json({ success: true, data: warnings });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.checkCompatibility = checkCompatibility;
//# sourceMappingURL=compatibilityController.js.map