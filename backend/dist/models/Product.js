"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ProductSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        trim: true,
    },
    brand: {
        type: String,
        required: [true, 'Please provide a brand name'],
        trim: true,
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
    },
    skinType: {
        type: String,
        enum: ['All', 'Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'],
        default: 'All',
    },
    ingredients: [{
            type: String,
            trim: true,
        }],
    quantity: {
        type: Number,
        default: 100,
        min: 0,
        max: 100,
    },
    purchaseDate: {
        type: Date,
        default: Date.now,
    },
    openingDate: {
        type: Date,
    },
    expiryDate: {
        type: Date,
    },
    image: {
        type: String,
        default: '',
    },
    notes: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'expiring', 'low'],
        default: 'active',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
ProductSchema.pre('save', function (next) {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (this.expiryDate && this.expiryDate <= now) {
        this.status = 'expired';
    }
    else if (this.expiryDate && this.expiryDate <= thirtyDaysFromNow) {
        this.status = 'expiring';
    }
    else if (this.quantity <= 20) {
        this.status = 'low';
    }
    else {
        this.status = 'active';
    }
    next();
});
exports.default = mongoose_1.default.model('Product', ProductSchema);
//# sourceMappingURL=Product.js.map