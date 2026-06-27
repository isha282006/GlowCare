import { Router } from 'express';
import {
  getRules, createRule, updateRule, deleteRule, checkCompatibility,
} from '../controllers/compatibilityController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/check', checkCompatibility);
router.route('/').get(getRules).post(authorize('admin'), createRule);
router.route('/:id').put(authorize('admin'), updateRule).delete(authorize('admin'), deleteRule);

export default router;
