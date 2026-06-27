import { Router } from 'express';
import {
  getJournalEntries, getJournalEntry, createJournalEntry, updateJournalEntry, deleteJournalEntry,
} from '../controllers/journalController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(protect);

router.route('/').get(getJournalEntries).post(upload.single('progressPhoto'), createJournalEntry);
router.route('/:id').get(getJournalEntry).put(upload.single('progressPhoto'), updateJournalEntry).delete(deleteJournalEntry);

export default router;
