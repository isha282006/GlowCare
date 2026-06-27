import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IJournalEntry, {}, {}, {}, mongoose.Document<unknown, {}, IJournalEntry, {}, {}> & IJournalEntry & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=JournalEntry.d.ts.map