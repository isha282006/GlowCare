import { Router } from 'express';
import {
  getRoutines, getRoutine, createRoutine, updateRoutine, deleteRoutine,
  toggleStep, checkCompatibility, getRoutineHistory, resetRoutine,
} from '../controllers/routineController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/history', getRoutineHistory);
router.post('/check-compatibility', checkCompatibility);
router.route('/').get(getRoutines).post(createRoutine);
router.route('/:id').get(getRoutine).put(updateRoutine).delete(deleteRoutine);
router.put('/:id/steps/:stepId/toggle', toggleStep);
router.put('/:id/reset', resetRoutine);

export default router;
