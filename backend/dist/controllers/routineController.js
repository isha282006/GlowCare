"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetRoutine = exports.getRoutineHistory = exports.checkCompatibility = exports.toggleStep = exports.deleteRoutine = exports.updateRoutine = exports.createRoutine = exports.getRoutine = exports.getRoutines = void 0;
const Routine_1 = __importDefault(require("../models/Routine"));
const RoutineHistory_1 = __importDefault(require("../models/RoutineHistory"));
const CompatibilityRule_1 = __importDefault(require("../models/CompatibilityRule"));
const Product_1 = __importDefault(require("../models/Product"));
// @desc    Get user routines
// @route   GET /api/routines
const getRoutines = async (req, res) => {
    try {
        const routines = await Routine_1.default.find({ user: req.user._id }).populate('steps.product', 'name brand image');
        res.status(200).json({ success: true, data: routines });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getRoutines = getRoutines;
// @desc    Get single routine
// @route   GET /api/routines/:id
const getRoutine = async (req, res) => {
    try {
        const routine = await Routine_1.default.findOne({ _id: req.params.id, user: req.user._id })
            .populate('steps.product', 'name brand image ingredients');
        if (!routine) {
            res.status(404).json({ success: false, message: 'Routine not found' });
            return;
        }
        res.status(200).json({ success: true, data: routine });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getRoutine = getRoutine;
// @desc    Create or update routine
// @route   POST /api/routines
const createRoutine = async (req, res) => {
    try {
        const { type, steps } = req.body;
        let routine = await Routine_1.default.findOne({ user: req.user._id, type });
        if (routine) {
            routine.steps = steps;
            await routine.save();
        }
        else {
            routine = await Routine_1.default.create({
                user: req.user._id,
                type,
                steps,
            });
        }
        await routine.populate('steps.product', 'name brand image ingredients');
        res.status(201).json({ success: true, data: routine });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createRoutine = createRoutine;
// @desc    Update routine steps
// @route   PUT /api/routines/:id
const updateRoutine = async (req, res) => {
    try {
        const routine = await Routine_1.default.findOne({ _id: req.params.id, user: req.user._id });
        if (!routine) {
            res.status(404).json({ success: false, message: 'Routine not found' });
            return;
        }
        routine.steps = req.body.steps || routine.steps;
        await routine.save();
        await routine.populate('steps.product', 'name brand image ingredients');
        res.status(200).json({ success: true, data: routine });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateRoutine = updateRoutine;
// @desc    Delete routine
// @route   DELETE /api/routines/:id
const deleteRoutine = async (req, res) => {
    try {
        const routine = await Routine_1.default.findOne({ _id: req.params.id, user: req.user._id });
        if (!routine) {
            res.status(404).json({ success: false, message: 'Routine not found' });
            return;
        }
        await Routine_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Routine deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteRoutine = deleteRoutine;
// @desc    Mark step complete/incomplete
// @route   PUT /api/routines/:id/steps/:stepId/toggle
const toggleStep = async (req, res) => {
    try {
        const routine = await Routine_1.default.findOne({ _id: req.params.id, user: req.user._id });
        if (!routine) {
            res.status(404).json({ success: false, message: 'Routine not found' });
            return;
        }
        const step = routine.steps.find((s) => s._id.toString() === req.params.stepId);
        if (!step) {
            res.status(404).json({ success: false, message: 'Step not found' });
            return;
        }
        step.completed = !step.completed;
        await routine.save();
        // Save routine history
        const completedSteps = routine.steps.filter((s) => s.completed).length;
        const totalSteps = routine.steps.length;
        const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await RoutineHistory_1.default.findOneAndUpdate({ user: req.user._id, routine: routine._id, date: today, routineType: routine.type }, {
            completedSteps,
            totalSteps,
            completionPercentage,
        }, { upsert: true, new: true });
        await routine.populate('steps.product', 'name brand image ingredients');
        res.status(200).json({ success: true, data: routine });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.toggleStep = toggleStep;
// @desc    Check compatibility for routine
// @route   POST /api/routines/check-compatibility
const checkCompatibility = async (req, res) => {
    try {
        const { productIds } = req.body;
        const products = await Product_1.default.find({ _id: { $in: productIds } });
        const allIngredients = [];
        products.forEach((product) => {
            product.ingredients.forEach((ing) => {
                if (!allIngredients.includes(ing.toLowerCase())) {
                    allIngredients.push(ing.toLowerCase());
                }
            });
        });
        const warnings = [];
        const rules = await CompatibilityRule_1.default.find({});
        for (const rule of rules) {
            const hasA = allIngredients.some((ing) => ing.toLowerCase().includes(rule.ingredientA.toLowerCase()) ||
                rule.ingredientA.toLowerCase().includes(ing.toLowerCase()));
            const hasB = allIngredients.some((ing) => ing.toLowerCase().includes(rule.ingredientB.toLowerCase()) ||
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
// @desc    Get routine history
// @route   GET /api/routines/history
const getRoutineHistory = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        const history = await RoutineHistory_1.default.find({
            user: req.user._id,
            date: { $gte: startDate },
        }).sort({ date: -1 });
        res.status(200).json({ success: true, data: history });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getRoutineHistory = getRoutineHistory;
// @desc    Reset daily routine completion
// @route   PUT /api/routines/:id/reset
const resetRoutine = async (req, res) => {
    try {
        const routine = await Routine_1.default.findOne({ _id: req.params.id, user: req.user._id });
        if (!routine) {
            res.status(404).json({ success: false, message: 'Routine not found' });
            return;
        }
        routine.steps.forEach((step) => {
            step.completed = false;
        });
        await routine.save();
        await routine.populate('steps.product', 'name brand image ingredients');
        res.status(200).json({ success: true, data: routine });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.resetRoutine = resetRoutine;
//# sourceMappingURL=routineController.js.map