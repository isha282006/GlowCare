"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.post('/register', (0, validate_1.validate)([
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
]), authController_1.register);
router.post('/login', (0, validate_1.validate)([
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
]), authController_1.login);
router.get('/me', auth_1.protect, authController_1.getMe);
router.put('/profile', auth_1.protect, authController_1.updateProfile);
router.put('/change-password', auth_1.protect, authController_1.changePassword);
router.put('/profile-picture', auth_1.protect, upload_1.upload.single('profilePicture'), authController_1.uploadProfilePicture);
router.post('/forgot-password', authController_1.forgotPassword);
router.put('/reset-password/:resetToken', authController_1.resetPassword);
router.post('/logout', auth_1.protect, authController_1.logout);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map