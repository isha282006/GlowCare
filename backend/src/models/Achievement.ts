import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievement extends Document {
  user: mongoose.Types.ObjectId;
  type: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date | null;
  progress: number;
  target: number;
  isUnlocked: boolean;
}

const AchievementSchema = new Schema<IAchievement>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '🏆',
  },
  unlockedAt: {
    type: Date,
    default: null,
  },
  progress: {
    type: Number,
    default: 0,
  },
  target: {
    type: Number,
    required: true,
  },
  isUnlocked: {
    type: Boolean,
    default: false,
  },
});

AchievementSchema.index({ user: 1, type: 1 }, { unique: true });

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);
