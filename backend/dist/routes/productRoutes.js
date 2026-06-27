"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.get('/stats', productController_1.getProductStats);
router.route('/').get(productController_1.getProducts).post(upload_1.upload.single('image'), productController_1.createProduct);
router.route('/:id').get(productController_1.getProduct).put(upload_1.upload.single('image'), productController_1.updateProduct).delete(productController_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=productRoutes.js.map