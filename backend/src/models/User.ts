import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  profilePicture: string;
  profilePhoto?: string;
  progressPhotos?: string[];
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  skinReport?: any;
  onboardingCompleted: boolean;
  hasInteractedWithInventory: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  profilePicture: {
    type: String,
    default: '',
  },
  profilePhoto: {
    type: String,
    default: '',
  },
  progressPhotos: {
    type: [String],
    default: [],
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  skinReport: {
    type: Schema.Types.Mixed,
    default: null,
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  hasInteractedWithInventory: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.getSignedJwtToken = function (): string {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRE || '30d') as any,
  });
};

export default mongoose.model<IUser>('User', UserSchema);
