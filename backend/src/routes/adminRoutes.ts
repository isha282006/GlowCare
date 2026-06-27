import { Router } from 'express';
import { getUsers, deleteUser, getPlatformStats } from '../controllers/adminController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/stats', getPlatformStats);

export default router;
