import { Response } from 'express';
import Wishlist from '../models/Wishlist';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all wishlist items
// @route   GET /api/wishlist
export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await Wishlist.find({ user: req.user!._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add to wishlist
// @route   POST /api/wishlist
export const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    req.body.user = req.user!._id;
    const item = await Wishlist.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update wishlist item
// @route   PUT /api/wishlist/:id
export const updateWishlistItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Wishlist.findOne({ _id: req.params.id, user: req.user!._id });
    if (!item) {
      res.status(404).json({ success: false, message: 'Wishlist item not found' });
      return;
    }

    const updated = await Wishlist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete wishlist item
// @route   DELETE /api/wishlist/:id
export const deleteWishlistItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Wishlist.findOne({ _id: req.params.id, user: req.user!._id });
    if (!item) {
      res.status(404).json({ success: false, message: 'Wishlist item not found' });
      return;
    }
    await Wishlist.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Wishlist item deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Move wishlist item to inventory
// @route   POST /api/wishlist/:id/move-to-inventory
export const moveToInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Wishlist.findOne({ _id: req.params.id, user: req.user!._id });
    if (!item) {
      res.status(404).json({ success: false, message: 'Wishlist item not found' });
      return;
    }

    const product = await Product.create({
      user: req.user!._id,
      name: item.productName,
      brand: item.brand || 'Unknown',
      category: item.category || 'Other',
      quantity: 100,
      purchaseDate: new Date(),
      price: item.price || 0,
      notes: item.notes,
    });

    await Wishlist.findByIdAndDelete(req.params.id);

    res.status(201).json({
      success: true,
      data: product,
      message: 'Item moved to inventory',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
