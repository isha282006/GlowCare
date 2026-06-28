import mongoose, { Document } from 'mongoose';
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
    age?: number;
    gender?: string;
    skinType?: string;
    skinConcerns?: string[];
    skinScore?: number;
    skinTone?: string;
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate?: Date;
    completedDays: Date[];
    waterGoal: number;
    currentWaterIntake: number;
    comparePassword(candidatePassword: string): Promise<boolean>;
    getSignedJwtToken(): string;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map