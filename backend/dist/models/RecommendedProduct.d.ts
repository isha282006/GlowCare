import mongoose, { Document } from 'mongoose';
export interface IRecommendedProduct extends Document {
    name: string;
    brand: string;
    category: string;
    ingredients: string;
    skinTypes: string[];
    skinConcerns: string[];
    timeOfDay: 'Morning' | 'Night' | 'Both';
    description: string;
    howToUse: string;
    whyRecommended: string;
}
declare const _default: mongoose.Model<IRecommendedProduct, {}, {}, {}, mongoose.Document<unknown, {}, IRecommendedProduct, {}, {}> & IRecommendedProduct & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=RecommendedProduct.d.ts.map