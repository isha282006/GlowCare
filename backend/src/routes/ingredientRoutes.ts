import { Router } from 'express';
import { getIngredients, createIngredient, updateIngredient, deleteIngredient } from '../controllers/ingredientController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/').get(getIngredients).post(authorize('admin'), createIngredient);
router.route('/:id').put(authorize('admin'), updateIngredient).delete(authorize('admin'), deleteIngredient);

export default router;
