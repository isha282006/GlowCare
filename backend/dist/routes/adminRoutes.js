"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.use((0, auth_1.authorize)('admin'));
router.get('/users', adminController_1.getUsers);
router.delete('/users/:id', adminController_1.deleteUser);
router.get('/stats', adminController_1.getPlatformStats);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map