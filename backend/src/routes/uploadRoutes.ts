import { Router } from 'express';
import { uploadProfilePhoto, uploadProgressPhoto } from '../controllers/uploadController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(protect);

router.post('/profile-photo', upload.single('image'), uploadProfilePhoto);
router.post('/progress-photo', upload.single('image'), uploadProgressPhoto);

export default router;
