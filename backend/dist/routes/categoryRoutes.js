"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.route('/').get(categoryController_1.getCategories).post((0, auth_1.authorize)('admin'), categoryController_1.createCategory);
router.route('/:id').put((0, auth_1.authorize)('admin'), categoryController_1.updateCategory).delete((0, auth_1.authorize)('admin'), categoryController_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=categoryRoutes.js.map