import mongoose, { Document, Schema } from 'mongoose';

export interface IPhoto extends Document {
  user: mongoose.Types.ObjectId;
  image: string;
  date: Date;
  category: 'before' | 'after' | 'progress';
  notes: string;
  createdAt: Date;
}

const PhotoSchema = new Schema<IPhoto>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  image: {
    type: String,
    required: [true, 'Please provide an image'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    enum: ['before', 'after', 'progress'],
    default: 'progress',
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PhotoSchema.index({ user: 1, date: -1 });

export default mongoose.model<IPhoto>('Photo', PhotoSchema);
