import mongoose, { Document, Schema } from 'mongoose';

export interface ICompatibilityRule extends Document {
  ingredientA: string;
  ingredientB: string;
  status: 'safe' | 'warning' | 'avoid';
  warningMessage: string;
  createdAt: Date;
}

const CompatibilityRuleSchema = new Schema<ICompatibilityRule>({
  ingredientA: {
    type: String,
    required: [true, 'Please provide ingredient A'],
    trim: true,
  },
  ingredientB: {
    type: String,
    required: [true, 'Please provide ingredient B'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['safe', 'warning', 'avoid'],
    required: [true, 'Please provide compatibility status'],
  },
  warningMessage: {
    type: String,
    required: [true, 'Please provide a warning message'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

CompatibilityRuleSchema.index({ ingredientA: 1, ingredientB: 1 }, { unique: true });

export default mongoose.model<ICompatibilityRule>('CompatibilityRule', CompatibilityRuleSchema);
