import mongoose, { Document, Schema } from 'mongoose';

export interface IRoutineStep {
  order: number;
  stepType: string;
  product?: mongoose.Types.ObjectId;
  productName?: string;
  completed: boolean;
}

export interface IRoutine extends Document {
  user: mongoose.Types.ObjectId;
  type: 'morning' | 'night';
  steps: IRoutineStep[];
  createdAt: Date;
  updatedAt: Date;
}

const RoutineStepSchema = new Schema({
  order: {
    type: Number,
    required: true,
  },
  stepType: {
    type: String,
    required: true,
    enum: ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Eye Cream', 'Lip Balm', 'Face Mask', 'Exfoliator', 'Treatment', 'Other'],
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
  productName: {
    type: String,
    default: '',
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, { _id: true });

const RoutineSchema = new Schema<IRoutine>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['morning', 'night'],
    required: true,
  },
  steps: [RoutineStepSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

RoutineSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IRoutine>('Routine', RoutineSchema);
