import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IAchievement, {}, {}, {}, mongoose.Document<unknown, {}, IAchievement, {}, {}> & IAchievement & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Achievement.d.ts.map