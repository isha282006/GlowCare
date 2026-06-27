"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIngredient = exports.updateIngredient = exports.createIngredient = exports.getIngredients = void 0;
const Ingredient_1 = __importDefault(require("../models/Ingredient"));
// @desc    Get all ingredients
// @route   GET /api/ingredients
const getIngredients = async (req, res) => {
    try {
        const query = {};
        if (req.query.search) {
            query.name = new RegExp(req.query.search, 'i');
        }
        if (req.query.category) {
            query.category = req.query.category;
        }
        const ingredients = await Ingredient_1.default.find(query).sort({ name: 1 });
        res.status(200).json({ success: true, data: ingredients });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getIngredients = getIngredients;
// @desc    Create ingredient (admin)
// @route   POST /api/ingredients
const createIngredient = async (req, res) => {
    try {
        const ingredient = await Ingredient_1.default.create(req.body);
        res.status(201).json({ success: true, data: ingredient });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createIngredient = createIngredient;
// @desc    Update ingredient (admin)
// @route   PUT /api/ingredients/:id
const updateIngredient = async (req, res) => {
    try {
        const ingredient = await Ingredient_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!ingredient) {
            res.status(404).json({ success: false, message: 'Ingredient not found' });
            return;
        }
        res.status(200).json({ success: true, data: ingredient });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateIngredient = updateIngredient;
// @desc    Delete ingredient (admin)
// @route   DELETE /api/ingredients/:id
const deleteIngredient = async (req, res) => {
    try {
        const ingredient = await Ingredient_1.default.findByIdAndDelete(req.params.id);
        if (!ingredient) {
            res.status(404).json({ success: false, message: 'Ingredient not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Ingredient deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteIngredient = deleteIngredient;
//# sourceMappingURL=ingredientController.js.map