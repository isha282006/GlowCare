import { Router } from 'express';
import { getAchievements, checkAchievements } from '../controllers/achievementController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getAchievements);
router.post('/check', checkAchievements);

export default router;
