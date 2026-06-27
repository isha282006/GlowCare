import { Router } from 'express';
import { getPhotos, uploadPhoto, deletePhoto, getMonthlyPhotos } from '../controllers/photoController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(protect);

router.get('/monthly', getMonthlyPhotos);
router.route('/').get(getPhotos).post(upload.single('image'), uploadPhoto);
router.route('/:id').delete(deletePhoto);

export default router;
