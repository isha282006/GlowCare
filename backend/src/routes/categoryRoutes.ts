import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/').get(getCategories).post(authorize('admin'), createCategory);
router.route('/:id').put(authorize('admin'), updateCategory).delete(authorize('admin'), deleteCategory);

export default router;
