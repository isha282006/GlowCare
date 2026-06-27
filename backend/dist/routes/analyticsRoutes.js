"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.get('/dashboard', analyticsController_1.getDashboardStats);
router.get('/routine-completion', analyticsController_1.getRoutineCompletion);
router.get('/products', analyticsController_1.getProductStats);
router.get('/journal', analyticsController_1.getJournalStats);
router.get('/weekly', analyticsController_1.getWeeklyActivity);
exports.default = router;
//# sourceMappingURL=analyticsRoutes.js.map