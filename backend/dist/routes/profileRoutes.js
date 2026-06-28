"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profileController_1 = require("../controllers/profileController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.post('/upload-photo', upload_1.upload.single('image'), profileController_1.uploadOrUpdateProfilePhoto);
router.put('/update-photo', upload_1.upload.single('image'), profileController_1.uploadOrUpdateProfilePhoto);
router.delete('/remove-photo', profileController_1.removeProfilePhoto);
router.get('/me', profileController_1.getProfileMe);
exports.default = router;
//# sourceMappingURL=profileRoutes.js.map