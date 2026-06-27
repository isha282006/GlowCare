import mongoose, { Document } from 'mongoose';
export interface IRoutineHistory extends Document {
    user: mongoose.Types.ObjectId;
    routine: mongoose.Types.ObjectId;
    routineType: 'morning' | 'night';
    date: Date;
    completedSteps: number;
    totalSteps: number;
    completionPercentage: number;
    createdAt: Date;
}
declare const _default: mongoose.Model<IRoutineHistory, {}, {}, {}, mongoose.Document<unknown, {}, IRoutineHistory, {}, {}> & IRoutineHistory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=RoutineHistory.d.ts.map