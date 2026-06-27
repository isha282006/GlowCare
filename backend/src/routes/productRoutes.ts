import { Router } from 'express';
import {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, getProductStats,
} from '../controllers/productController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(protect);

router.get('/stats', getProductStats);
router.route('/').get(getProducts).post(upload.single('image'), createProduct);
router.route('/:id').get(getProduct).put(upload.single('image'), updateProduct).delete(deleteProduct);

export default router;
