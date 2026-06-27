"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const photoController_1 = require("../controllers/photoController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.get('/monthly', photoController_1.getMonthlyPhotos);
router.route('/').get(photoController_1.getPhotos).post(upload_1.upload.single('image'), photoController_1.uploadPhoto);
router.route('/:id').delete(photoController_1.deletePhoto);
exports.default = router;
//# sourceMappingURL=photoRoutes.js.map