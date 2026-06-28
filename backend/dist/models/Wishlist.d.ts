import mongoose, { Document } from 'mongoose';
export interface IWishlist extends Document {
    user: mongoose.Types.ObjectId;
    productName: string;
    brand: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    notes: string;
    price: number;
    reminderDate?: Date;
    createdAt: Date;
}
declare const _default: mongoose.Model<IWishlist, {}, {}, {}, mongoose.Document<unknown, {}, IWishlist, {}, {}> & IWishlist & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Wishlist.d.ts.map