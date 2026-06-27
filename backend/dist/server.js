"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = __importDefault(require("./config/db"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
// Route imports
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const routineRoutes_1 = __importDefault(require("./routes/routineRoutes"));
const journalRoutes_1 = __importDefault(require("./routes/journalRoutes"));
const photoRoutes_1 = __importDefault(require("./routes/photoRoutes"));
const wishlistRoutes_1 = __importDefault(require("./routes/wishlistRoutes"));
const compatibilityRoutes_1 = __importDefault(require("./routes/compatibilityRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const ingredientRoutes_1 = __importDefault(require("./routes/ingredientRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const achievementRoutes_1 = __importDefault(require("./routes/achievementRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const calendarRoutes_1 = __importDefault(require("./routes/calendarRoutes"));
const dataRoutes_1 = __importDefault(require("./routes/dataRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Create uploads directory
const uploadsDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
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
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Static files - serve uploads
app.use('/uploads', express_1.default.static(uploadsDir));
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/routines', routineRoutes_1.default);
app.use('/api/journal', journalRoutes_1.default);
app.use('/api/photos', photoRoutes_1.default);
app.use('/api/wishlist', wishlistRoutes_1.default);
app.use('/api/compatibility', compatibilityRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/ingredients', ingredientRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.use('/api/achievements', achievementRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/calendar', calendarRoutes_1.default);
app.use('/api/data', dataRoutes_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'GlowCare API is running' });
});
// Error handler
app.use(errorHandler_1.default);
// Connect to DB and start server
(0, db_1.default)().then(() => {
    app.listen(PORT, () => {
        console.log(`GlowCare API server running on port ${PORT}`);
    });
});
exports.default = app;
//# sourceMappingURL=server.js.map