import mongoose, { Document } from 'mongoose';
export interface IRoutineStep {
    order: number;
    stepType: string;
    product?: mongoose.Types.ObjectId;
    productName?: string;
    completed: boolean;
}
export interface IRoutine extends Document {
    user: mongoose.Types.ObjectId;
    type: 'morning' | 'night';
    steps: IRoutineStep[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IRoutine, {}, {}, {}, mongoose.Document<unknown, {}, IRoutine, {}, {}> & IRoutine & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Routine.d.ts.map