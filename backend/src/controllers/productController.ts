import { Response } from 'express';
import Product from '../models/Product';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// 8-10 Sample Skincare Products
const demoProducts = [
  {
    name: 'Hydrating Cleanser',
    brand: 'CeraVe',
    category: 'Cleanser',
    skinType: 'Dry',
    ingredients: ['Ceramides', 'Hyaluronic Acid', 'Glycerin'],
    quantity: 85,
    price: 15.99,
    routineUsage: 'both',
    purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    notes: 'Very gentle cleanser, does not strip the skin barrier. Perfect for daily hydration.',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400',
  },
  {
    name: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    category: 'Serum',
    skinType: 'Oily',
    ingredients: ['Niacinamide', 'Zinc PCA', 'Tamarind Seed Gum'],
    quantity: 60,
    price: 6.50,
    routineUsage: 'morning',
    purchaseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
    notes: 'Helps with sebum regulation and minimizes the appearance of large pores.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400',
  },
  {
    name: 'Effaclar Duo Dual Action Acne Treatment',
    brand: 'La Roche-Posay',
    category: 'Treatment',
    skinType: 'Combination',
    ingredients: ['Benzoyl Peroxide', 'LHA', 'Salicylic Acid'],
    quantity: 40,
    price: 22.99,
    routineUsage: 'night',
    purchaseDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    expiryDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000), // 8 months from now
    notes: 'Excellent spot treatment for active acne breakouts. Can be drying, use sparingly.',
    image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400',
  },
  {
    name: 'Moisturizing Cream',
    brand: 'Cetaphil',
    category: 'Moisturizer',
    skinType: 'Sensitive',
    ingredients: ['Sweet Almond Oil', 'Glycerin', 'Vitamin E'],
    quantity: 90,
    price: 14.50,
    routineUsage: 'both',
    purchaseDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
    expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 2 years from now
    notes: 'Rich, non-greasy moisturizing cream. Ideal for locking in hydration at night.',
    image: 'https://images.unsplash.com/photo-1626245917822-28c00aa16b32?q=80&w=400',
  },
  {
    name: 'Relief Sun : Rice + Probiotics SPF50+',
    brand: 'Beauty of Joseon',
    category: 'Sunscreen',
    skinType: 'All',
    ingredients: ['Rice Extract', 'Probiotics', 'Adenosine'],
    quantity: 75,
    price: 18.00,
    routineUsage: 'morning',
    purchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    expiryDate: new Date(Date.now() + 540 * 24 * 60 * 60 * 1000), // 1.5 years from now
    notes: 'Organic lightweight sunscreen. Feels like a light moisturizer, leaves no white cast.',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=400',
  },
  {
    name: 'Advanced Snail 96 Mucin Power Essence',
    brand: 'COSRX',
    category: 'Serum',
    skinType: 'Dry',
    ingredients: ['Snail Secretion Filtrate', 'Sodium Hyaluronate', 'Allantoin'],
    quantity: 50,
    price: 21.00,
    routineUsage: 'night',
    purchaseDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000), // 10 months from now
    notes: 'Very hydrating and soothing essence. Helps repair damaged skin barriers and smooth texture.',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=400',
  },
  {
    name: 'Skin Perfecting 2% BHA Liquid Exfoliant',
    brand: 'Paula\'s Choice',
    category: 'Exfoliator',
    skinType: 'Combination',
    ingredients: ['Salicylic Acid', 'Green Tea Extract', 'Methylpropanediol'],
    quantity: 80,
    price: 34.00,
    routineUsage: 'night',
    purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    expiryDate: new Date(Date.now() + 450 * 24 * 60 * 60 * 1000), // 1.2 years from now
    notes: 'Tones down skin congestion, targets blackheads. Apply 2-3 times a week at night.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=400',
  },
  {
    name: 'Lip Sleeping Mask Berry',
    brand: 'Laneige',
    category: 'Lip Care',
    skinType: 'All',
    ingredients: ['Shea Butter', 'Berry Fruit Complex', 'Vitamin C'],
    quantity: 95,
    price: 24.00,
    routineUsage: 'night',
    purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    expiryDate: new Date(Date.now() + 1095 * 24 * 60 * 60 * 1000), // 3 years from now
    notes: 'Deeply nourishing lip mask. Wake up with smooth, moisturized, lip lines.',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=400',
  }
];

// @desc    Get all products for user
// @route   GET /api/products
export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;

    // Check if seeding is required
    const existingCount = await Product.countDocuments({ user: userId });
    const userDoc = await User.findById(userId);

    if (existingCount === 0 && userDoc && !userDoc.hasInteractedWithInventory) {
      // Auto seed sample products
      const seeded = demoProducts.map((p) => ({
        ...p,
        user: userId,
      }));
      await Product.insertMany(seeded);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const query: any = { user: userId };

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

    // Update statuses dynamically
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

    // Set interaction flag
    await User.findByIdAndUpdate(req.user!._id, { hasInteractedWithInventory: true });

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

    // Set interaction flag
    await User.findByIdAndUpdate(req.user!._id, { hasInteractedWithInventory: true });

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

    // Set interaction flag
    await User.findByIdAndUpdate(req.user!._id, { hasInteractedWithInventory: true });

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
