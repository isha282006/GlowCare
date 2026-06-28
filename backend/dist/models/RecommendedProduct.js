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
const RecommendedProductSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    brand: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Cleanser', 'Serum', 'Moisturizer', 'Sunscreen', 'Eye Care', 'Lip Care', 'Exfoliator', 'Toner', 'Mask', 'Treatment'],
    },
    ingredients: {
        type: String,
        required: true,
    },
    skinTypes: [{
            type: String,
            enum: ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'],
        }],
    skinConcerns: [{
            type: String,
            enum: [
                'Acne', 'Pigmentation', 'Dark Spots', 'Dry Lips', 'Blackheads',
                'Whiteheads', 'Large Pores', 'Redness', 'Fine Lines', 'Wrinkles',
                'Dullness', 'Under-eye Dark Circles'
            ],
        }],
    timeOfDay: {
        type: String,
        enum: ['Morning', 'Night', 'Both'],
        default: 'Both',
    },
    description: {
        type: String,
        default: '',
    },
    howToUse: {
        type: String,
        default: '',
    },
    whyRecommended: {
        type: String,
        default: '',
    },
});
RecommendedProductSchema.index({ skinTypes: 1, skinConcerns: 1 });
RecommendedProductSchema.index({ category: 1, skinTypes: 1 });
exports.default = mongoose_1.default.model('RecommendedProduct', RecommendedProductSchema);
//# sourceMappingURL=RecommendedProduct.js.map