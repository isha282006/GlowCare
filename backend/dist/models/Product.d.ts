import mongoose, { Document } from 'mongoose';
export interface IProduct extends Document {
    user: mongoose.Types.ObjectId;
    name: string;
    brand: string;
    category: string;
    skinType: string;
    ingredients: string[];
    quantity: number;
    purchaseDate: Date;
    openingDate: Date;
    expiryDate: Date;
    image: string;
    notes: string;
    price: number;
    routineUsage: 'morning' | 'night' | 'both' | 'none';
    status: 'active' | 'expired' | 'expiring' | 'low';
    createdAt: Date;
}
declare const _default: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, {}> & IProduct & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Product.d.ts.map