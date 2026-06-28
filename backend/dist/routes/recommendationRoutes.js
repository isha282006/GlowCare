"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const recommendationController_1 = require("../controllers/recommendationController");
const router = express_1.default.Router();
router.post('/generate', auth_1.protect, recommendationController_1.generateRecommendation);
router.get('/products', auth_1.protect, recommendationController_1.getRecommendedProducts);
router.get('/match', auth_1.protect, recommendationController_1.getMatchedProducts);
exports.default = router;
//# sourceMappingURL=recommendationRoutes.js.map