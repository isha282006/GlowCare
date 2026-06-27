import { Response } from 'express';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all products for user
// @route   GET /api/products
export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const query: any = { user: req.user!._id };

    // Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
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
    let sortObj: any = { createdAt: -1 };
    if (req.query.sort === 'name') sortObj = { name: 1 };
    if (req.query.sort === 'expiry') sortObj = { expiryDate: 1 };
    if (req.query.sort === 'brand') sortObj = { brand: 1 };
    if (req.query.sort === 'newest') sortObj = { createdAt: -1 };
    if (req.query.sort === 'oldest') sortObj = { createdAt: 1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    // Update statuses
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    for (const product of products) {
      let newStatus = 'active';
      if (product.expiryDate && product.expiryDate <= now) newStatus = 'expired';
      else if (product.expiryDate && product.expiryDate <= thirtyDays) newStatus = 'expiring';
      else if (product.quantity <= 20) newStatus = 'low';

      if (product.status !== newStatus) {
        product.status = newStatus as any;
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
export const getProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findOne({ _id: req.params.id, user: req.user!._id });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.status(200).json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    req.body.user = req.user!._id;
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }
    if (typeof req.body.ingredients === 'string') {
      req.body.ingredients = req.body.ingredients.split(',').map((i: string) => i.trim());
    }

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let product = await Product.findOne({ _id: req.params.id, user: req.user!._id });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }
    if (typeof req.body.ingredients === 'string') {
      req.body.ingredients = req.body.ingredients.split(',').map((i: string) => i.trim());
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findOne({ _id: req.params.id, user: req.user!._id });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get product stats
// @route   GET /api/products/stats
export const getProductStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const total = await Product.countDocuments({ user: userId });
    const expired = await Product.countDocuments({ user: userId, expiryDate: { $lte: now } });
    const expiring = await Product.countDocuments({
      user: userId,
      expiryDate: { $gt: now, $lte: thirtyDays },
    });
    const low = await Product.countDocuments({ user: userId, quantity: { $lte: 20 } });

    const byCategory = await Product.aggregate([
      { $match: { user: req.user!._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: { total, expired, expiring, low, byCategory },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
