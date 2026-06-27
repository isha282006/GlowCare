import mongoose, { Document } from 'mongoose';
export interface IIngredient extends Document {
    name: string;
    description: string;
    category: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IIngredient, {}, {}, {}, mongoose.Document<unknown, {}, IIngredient, {}, {}> & IIngredient & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Ingredient.d.ts.map