"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wishlistController_1 = require("../controllers/wishlistController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.route('/').get(wishlistController_1.getWishlist).post(wishlistController_1.addToWishlist);
router.route('/:id').put(wishlistController_1.updateWishlistItem).delete(wishlistController_1.deleteWishlistItem);
router.post('/:id/move-to-inventory', wishlistController_1.moveToInventory);
exports.default = router;
//# sourceMappingURL=wishlistRoutes.js.map