import { Router } from 'express';
import { getCalendarEvents } from '../controllers/calendarController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getCalendarEvents);

export default router;
