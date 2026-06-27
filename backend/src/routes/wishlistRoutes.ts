import { Router } from 'express';
import {
  getWishlist, addToWishlist, updateWishlistItem, deleteWishlistItem, moveToInventory,
} from '../controllers/wishlistController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/').get(getWishlist).post(addToWishlist);
router.route('/:id').put(updateWishlistItem).delete(deleteWishlistItem);
router.post('/:id/move-to-inventory', moveToInventory);

export default router;
