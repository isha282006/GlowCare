import { Router } from 'express';
import { exportData, importData } from '../controllers/dataController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/export', exportData);
router.post('/import', importData);

export default router;
