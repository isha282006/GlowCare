import mongoose, { Document, Schema } from 'mongoose';

export interface IRoutineHistory extends Document {
  user: mongoose.Types.ObjectId;
  routine: mongoose.Types.ObjectId;
  routineType: 'morning' | 'night';
  date: Date;
  completedSteps: number;
  totalSteps: number;
  completionPercentage: number;
  createdAt: Date;
}

const RoutineHistorySchema = new Schema<IRoutineHistory>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  routine: {
    type: Schema.Types.ObjectId,
    ref: 'Routine',
    required: true,
  },
  routineType: {
    type: String,
    enum: ['morning', 'night'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  completedSteps: {
    type: Number,
    required: true,
  },
  totalSteps: {
    type: Number,
    required: true,
  },
  completionPercentage: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

RoutineHistorySchema.index({ user: 1, date: 1, routineType: 1 });

export default mongoose.model<IRoutineHistory>('RoutineHistory', RoutineHistorySchema);
