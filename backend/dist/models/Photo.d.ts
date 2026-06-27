import mongoose, { Document } from 'mongoose';
export interface IPhoto extends Document {
    user: mongoose.Types.ObjectId;
    image: string;
    date: Date;
    category: 'before' | 'after' | 'progress';
    notes: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IPhoto, {}, {}, {}, mongoose.Document<unknown, {}, IPhoto, {}, {}> & IPhoto & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Photo.d.ts.map