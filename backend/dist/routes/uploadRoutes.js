"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.post('/profile-photo', upload_1.upload.single('image'), uploadController_1.uploadProfilePhoto);
router.post('/progress-photo', upload_1.upload.single('image'), uploadController_1.uploadProgressPhoto);
exports.default = router;
//# sourceMappingURL=uploadRoutes.js.map