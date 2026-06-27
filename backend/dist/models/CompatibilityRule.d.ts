import mongoose, { Document } from 'mongoose';
export interface ICompatibilityRule extends Document {
    ingredientA: string;
    ingredientB: string;
    status: 'safe' | 'warning' | 'avoid';
    warningMessage: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<ICompatibilityRule, {}, {}, {}, mongoose.Document<unknown, {}, ICompatibilityRule, {}, {}> & ICompatibilityRule & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=CompatibilityRule.d.ts.map