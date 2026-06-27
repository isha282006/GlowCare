import { Router } from 'express';
import {
  getDashboardStats, getRoutineCompletion, getProductStats, getJournalStats, getWeeklyActivity,
} from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/routine-completion', getRoutineCompletion);
router.get('/products', getProductStats);
router.get('/journal', getJournalStats);
router.get('/weekly', getWeeklyActivity);

export default router;
