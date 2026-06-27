import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  productName: string;
  brand: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  notes: string;
  createdAt: Date;
}

const WishlistSchema = new Schema<IWishlist>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productName: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  brand: {
    type: String,
    default: '',
    trim: true,
  },
  category: {
    type: String,
    default: '',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IWishlist>('Wishlist', WishlistSchema);
