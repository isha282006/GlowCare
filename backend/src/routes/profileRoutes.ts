import { Router } from 'express';
import { 
  uploadOrUpdateProfilePhoto, 
  removeProfilePhoto, 
  getProfileMe 
} from '../controllers/profileController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(protect);

router.post('/upload-photo', upload.single('image'), uploadOrUpdateProfilePhoto);
router.put('/update-photo', upload.single('image'), uploadOrUpdateProfilePhoto);
router.delete('/remove-photo', removeProfilePhoto);
router.get('/me', getProfileMe);

export default router;
