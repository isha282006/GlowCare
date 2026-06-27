"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    try {
        // Automatically retrieve the default admin user seeded on startup
        let user = await User_1.default.findOne({ role: 'admin' });
        // Fallback just in case
        if (!user) {
            user = await User_1.default.findOne({});
        }
        // Double fallback: create default test user if completely empty
        if (!user) {
            user = await User_1.default.create({
                name: 'Test Skincare Lover',
                email: 'test@glowcare.com',
                password: 'password123',
                role: 'admin',
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Authentication bypass error', error: error.message });
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        // Skip role check and proceed since we are bypassing authentication
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map