import mongoose, { Document, Schema } from 'mongoose';

export interface IJournalEntry extends Document {
  user: mongoose.Types.ObjectId;
  date: Date;
  skinConcern: string[];
  waterIntake: number;
  sleepHours: number;
  stressLevel: number;
  mood: string;
  notes: string;
  progressPhoto: string;
  skinCondition: string;
  acne: 'None' | 'Mild' | 'Moderate' | 'Severe';
  dryness: 'None' | 'Mild' | 'Moderate' | 'Severe';
  oiliness: 'None' | 'Mild' | 'Moderate' | 'Severe';
  redness: 'None' | 'Mild' | 'Moderate' | 'Severe';
  reaction: string;
  rating: number;
  images: string[];
  createdAt: Date;
}

const JournalEntrySchema = new Schema<IJournalEntry>({
  user: {
    type: Schema.Types.ObjectId,
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

export default mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);
