import { Response } from 'express';
import CompatibilityRule from '../models/CompatibilityRule';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all compatibility rules
// @route   GET /api/compatibility
export const getRules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rules = await CompatibilityRule.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: rules });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create compatibility rule (admin)
// @route   POST /api/compatibility
export const createRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ingredientA, ingredientB, status, warningMessage } = req.body;

    const existing = await CompatibilityRule.findOne({
      $or: [
        { ingredientA: ingredientA, ingredientB: ingredientB },
        { ingredientA: ingredientB, ingredientB: ingredientA },
      ],
    });

    if (existing) {
      res.status(400).json({ success: false, message: 'Rule already exists for these ingredients' });
      return;
    }

    const rule = await CompatibilityRule.create({ ingredientA, ingredientB, status, warningMessage });
    res.status(201).json({ success: true, data: rule });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update compatibility rule (admin)
// @route   PUT /api/compatibility/:id
export const updateRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rule = await CompatibilityRule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!rule) {
      res.status(404).json({ success: false, message: 'Rule not found' });
      return;
    }
    res.status(200).json({ success: true, data: rule });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete compatibility rule (admin)
// @route   DELETE /api/compatibility/:id
export const deleteRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rule = await CompatibilityRule.findByIdAndDelete(req.params.id);
    if (!rule) {
      res.status(404).json({ success: false, message: 'Rule not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Rule deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check ingredient compatibility
// @route   POST /api/compatibility/check
export const checkCompatibility = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length < 2) {
      res.status(400).json({ success: false, message: 'Please provide at least 2 ingredients' });
      return;
    }

    const warnings: any[] = [];
    const rules = await CompatibilityRule.find({});

    for (const rule of rules) {
      const hasA = ingredients.some((ing: string) =>
        ing.toLowerCase().includes(rule.ingredientA.toLowerCase()) ||
        rule.ingredientA.toLowerCase().includes(ing.toLowerCase())
      );
      const hasB = ingredients.some((ing: string) =>
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
