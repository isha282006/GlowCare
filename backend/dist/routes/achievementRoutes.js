"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const achievementController_1 = require("../controllers/achievementController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.get('/', achievementController_1.getAchievements);
router.post('/check', achievementController_1.checkAchievements);
exports.default = router;
//# sourceMappingURL=achievementRoutes.js.map