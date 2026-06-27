"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ingredientController_1 = require("../controllers/ingredientController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.route('/').get(ingredientController_1.getIngredients).post((0, auth_1.authorize)('admin'), ingredientController_1.createIngredient);
router.route('/:id').put((0, auth_1.authorize)('admin'), ingredientController_1.updateIngredient).delete((0, auth_1.authorize)('admin'), ingredientController_1.deleteIngredient);
exports.default = router;
//# sourceMappingURL=ingredientRoutes.js.map