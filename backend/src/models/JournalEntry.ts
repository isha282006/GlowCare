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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

JournalEntrySchema.index({ user: 1, date: -1 });

export default mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);
