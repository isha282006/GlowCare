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
const JournalEntrySchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    skinConcern: [{
            type: String,
            trim: true,
        }],
    waterIntake: {
        type: Number,
        default: 0,
        min: 0,
        max: 20,
    },
    sleepHours: {
        type: Number,
        default: 0,
        min: 0,
        max: 24,
    },
    stressLevel: {
        type: Number,
        default: 1,
        min: 1,
        max: 10,
    },
    mood: {
        type: String,
        enum: ['Great', 'Good', 'Okay', 'Bad', 'Terrible'],
        default: 'Okay',
    },
    notes: {
        type: String,
        default: '',
    },
    progressPhoto: {
        type: String,
        default: '',
    },
    skinCondition: {
        type: String,
        default: '',
    },
    acne: {
        type: String,
        enum: ['None', 'Mild', 'Moderate', 'Severe'],
        default: 'None',
    },
    dryness: {
        type: String,
        enum: ['None', 'Mild', 'Moderate', 'Severe'],
        default: 'None',
    },
    oiliness: {
        type: String,
        enum: ['None', 'Mild', 'Moderate', 'Severe'],
        default: 'None',
    },
    redness: {
        type: String,
        enum: ['None', 'Mild', 'Moderate', 'Severe'],
        default: 'None',
    },
    reaction: {
        type: String,
        default: '',
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
    },
    images: [{
            type: String,
        }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
JournalEntrySchema.index({ user: 1, date: -1 });
exports.default = mongoose_1.default.model('JournalEntry', JournalEntrySchema);
//# sourceMappingURL=JournalEntry.js.map