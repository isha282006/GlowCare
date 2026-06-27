import { Response } from 'express';
import Routine from '../models/Routine';
import RoutineHistory from '../models/RoutineHistory';
import CompatibilityRule from '../models/CompatibilityRule';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

// @desc    Get user routines
// @route   GET /api/routines
export const getRoutines = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const routines = await Routine.find({ user: req.user!._id }).populate('steps.product', 'name brand image');
    res.status(200).json({ success: true, data: routines });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single routine
// @route   GET /api/routines/:id
export const getRoutine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const routine = await Routine.findOne({ _id: req.params.id, user: req.user!._id })
      .populate('steps.product', 'name brand image ingredients');
    if (!routine) {
      res.status(404).json({ success: false, message: 'Routine not found' });
      return;
    }
    res.status(200).json({ success: true, data: routine });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or update routine
// @route   POST /api/routines
export const createRoutine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, steps } = req.body;

    let routine = await Routine.findOne({ user: req.user!._id, type });

    if (routine) {
      routine.steps = steps;
      await routine.save();
    } else {
      routine = await Routine.create({
        user: req.user!._id,
        type,
        steps,
      });
    }

    await routine.populate('steps.product', 'name brand image ingredients');

    res.status(201).json({ success: true, data: routine });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update routine steps
// @route   PUT /api/routines/:id
export const updateRoutine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const routine = await Routine.findOne({ _id: req.params.id, user: req.user!._id });
    if (!routine) {
      res.status(404).json({ success: false, message: 'Routine not found' });
      return;
    }

    routine.steps = req.body.steps || routine.steps;
    await routine.save();
    await routine.populate('steps.product', 'name brand image ingredients');

    res.status(200).json({ success: true, data: routine });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete routine
// @route   DELETE /api/routines/:id
export const deleteRoutine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const routine = await Routine.findOne({ _id: req.params.id, user: req.user!._id });
    if (!routine) {
      res.status(404).json({ success: false, message: 'Routine not found' });
      return;
    }
    await Routine.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Routine deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark step complete/incomplete
// @route   PUT /api/routines/:id/steps/:stepId/toggle
export const toggleStep = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const routine = await Routine.findOne({ _id: req.params.id, user: req.user!._id });
    if (!routine) {
      res.status(404).json({ success: false, message: 'Routine not found' });
      return;
    }

    const step = routine.steps.find((s: any) => s._id.toString() === req.params.stepId);
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

    await RoutineHistory.findOneAndUpdate(
      { user: req.user!._id, routine: routine._id, date: today, routineType: routine.type },
      {
        completedSteps,
        totalSteps,
        completionPercentage,
      },
      { upsert: true, new: true }
    );

    await routine.populate('steps.product', 'name brand image ingredients');

    res.status(200).json({ success: true, data: routine });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check compatibility for routine
// @route   POST /api/routines/check-compatibility
export const checkCompatibility = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productIds } = req.body;

    const products = await Product.find({ _id: { $in: productIds } });
    const allIngredients: string[] = [];

    products.forEach((product) => {
      product.ingredients.forEach((ing) => {
        if (!allIngredients.includes(ing.toLowerCase())) {
          allIngredients.push(ing.toLowerCase());
        }
      });
    });

    const warnings: any[] = [];
    const rules = await CompatibilityRule.find({});

    for (const rule of rules) {
      const hasA = allIngredients.some((ing) =>
        ing.toLowerCase().includes(rule.ingredientA.toLowerCase()) ||
        rule.ingredientA.toLowerCase().includes(ing.toLowerCase())
      );
      const hasB = allIngredients.some((ing) =>
        ing.toLowerCase().includes(rule.ingredientB.toLowerCase()) ||
        rule.ingredientB.toLowerCase().includes(ing.toLowerCase())
      );

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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get routine history
// @route   GET /api/routines/history
export const getRoutineHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const history = await RoutineHistory.find({
      user: req.user!._id,
      date: { $gte: startDate },
    }).sort({ date: -1 });

    res.status(200).json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset daily routine completion
// @route   PUT /api/routines/:id/reset
export const resetRoutine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const routine = await Routine.findOne({ _id: req.params.id, user: req.user!._id });
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
