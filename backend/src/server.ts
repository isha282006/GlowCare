import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db';
import errorHandler from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import routineRoutes from './routes/routineRoutes';
import journalRoutes from './routes/journalRoutes';
import photoRoutes from './routes/photoRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import compatibilityRoutes from './routes/compatibilityRoutes';
import categoryRoutes from './routes/categoryRoutes';
import ingredientRoutes from './routes/ingredientRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import achievementRoutes from './routes/achievementRoutes';
import adminRoutes from './routes/adminRoutes';
import calendarRoutes from './routes/calendarRoutes';
import dataRoutes from './routes/dataRoutes';
import uploadRoutes from './routes/uploadRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
const allowedOrigins = [
  "https://glow-care-xi.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5176",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files - serve uploads
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/compatibility', compatibilityRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'GlowCare API is running' });
});

// Error handler
app.use(errorHandler);

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`GlowCare API server running on port ${PORT}`);
  });
});

export default app;
