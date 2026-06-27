import { Response } from 'express';
import Ingredient from '../models/Ingredient';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all ingredients
// @route   GET /api/ingredients
export const getIngredients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.query.search) {
      query.name = new RegExp(req.query.search as string, 'i');
    }
    if (req.query.category) {
      query.category = req.query.category;
    }

    const ingredients = await Ingredient.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, data: ingredients });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create ingredient (admin)
// @route   POST /api/ingredients
export const createIngredient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ingredient = await Ingredient.create(req.body);
    res.status(201).json({ success: true, data: ingredient });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ingredient (admin)
// @route   PUT /api/ingredients/:id
export const updateIngredient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!ingredient) {
      res.status(404).json({ success: false, message: 'Ingredient not found' });
      return;
    }
    res.status(200).json({ success: true, data: ingredient });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete ingredient (admin)
// @route   DELETE /api/ingredients/:id
export const deleteIngredient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
    if (!ingredient) {
      res.status(404).json({ success: false, message: 'Ingredient not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Ingredient deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
