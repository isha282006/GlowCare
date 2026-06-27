import { Response } from 'express';
import Product from '../models/Product';
import Routine from '../models/Routine';
import JournalEntry from '../models/JournalEntry';
import Wishlist from '../models/Wishlist';
import Photo from '../models/Photo';
import { AuthRequest } from '../middleware/auth';

// @desc    Export user data as JSON
// @route   GET /api/data/export
export const exportData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;

    const products = await Product.find({ user: userId });
    const routines = await Routine.find({ user: userId });
    const journal = await JournalEntry.find({ user: userId });
    const wishlist = await Wishlist.find({ user: userId });
    const photos = await Photo.find({ user: userId });

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        name: req.user!.name,
        email: req.user!.email,
      },
      products,
      routines,
      journal,
      wishlist,
      photos,
    };

    res.status(200).json({ success: true, data: exportData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Import user data from JSON
// @route   POST /api/data/import
export const importData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { products, routines, journal, wishlist } = req.body;

    let importedCounts = { products: 0, routines: 0, journal: 0, wishlist: 0 };

    if (products && Array.isArray(products)) {
      for (const p of products) {
        delete p._id;
        p.user = userId;
        await Product.create(p);
        importedCounts.products++;
      }
    }

    if (routines && Array.isArray(routines)) {
      for (const r of routines) {
        delete r._id;
        r.user = userId;
        await Routine.create(r);
        importedCounts.routines++;
      }
    }

    if (journal && Array.isArray(journal)) {
      for (const j of journal) {
        delete j._id;
        j.user = userId;
        await JournalEntry.create(j);
        importedCounts.journal++;
      }
    }

    if (wishlist && Array.isArray(wishlist)) {
      for (const w of wishlist) {
        delete w._id;
        w.user = userId;
        await Wishlist.create(w);
        importedCounts.wishlist++;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Data imported successfully',
      data: importedCounts,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
