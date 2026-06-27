"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Server Error';
    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
        message = `Duplicate value for ${field}. Please use another value.`;
    }
    // Mongoose validation error
    if (err.name === 'ValidationError' && err.errors) {
        statusCode = 400;
        message = Object.values(err.errors).map((val) => val.message).join(', ');
    }
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Resource not found';
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    // Multer file size error
    if (err.message && err.message.includes('File too large')) {
        statusCode = 400;
        message = 'File size cannot exceed 5MB';
    }
    console.error(`Error: ${message}`);
    res.status(statusCode).json({
        success: false,
        message,
    });
};
exports.default = errorHandler;
//# sourceMappingURL=errorHandler.js.map