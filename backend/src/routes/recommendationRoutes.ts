import express from 'express';
import { protect } from '../middleware/auth';
import {
  generateRecommendation,
  getRecommendedProducts,
  getMatchedProducts,
} from '../controllers/recommendationController';

const router = express.Router();

router.post('/generate', protect, generateRecommendation);
router.get('/products', protect, getRecommendedProducts);
router.get('/match', protect, getMatchedProducts);

export default router;
