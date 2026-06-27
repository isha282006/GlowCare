"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const compatibilityController_1 = require("../controllers/compatibilityController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.post('/check', compatibilityController_1.checkCompatibility);
router.route('/').get(compatibilityController_1.getRules).post((0, auth_1.authorize)('admin'), compatibilityController_1.createRule);
router.route('/:id').put((0, auth_1.authorize)('admin'), compatibilityController_1.updateRule).delete((0, auth_1.authorize)('admin'), compatibilityController_1.deleteRule);
exports.default = router;
//# sourceMappingURL=compatibilityRoutes.js.map