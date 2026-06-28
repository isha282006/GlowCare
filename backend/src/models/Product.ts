import mongoose, { Document, Schema } from 'mongoose';

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

const ProductSchema = new Schema<IProduct>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'Please provide a brand name'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
  },
  skinType: {
    type: String,
    enum: ['All', 'Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'],
    default: 'All',
  },
  ingredients: [{
    type: String,
    trim: true,
  }],
  quantity: {
    type: Number,
    default: 100,
    min: 0,
    max: 100,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  openingDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
  },
  image: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    default: 0,
  },
  routineUsage: {
    type: String,
    enum: ['morning', 'night', 'both', 'none'],
    default: 'both',
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'expiring', 'low'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ProductSchema.pre('save', function (next) {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (this.expiryDate && this.expiryDate <= now) {
    this.status = 'expired';
  } else if (this.expiryDate && this.expiryDate <= thirtyDaysFromNow) {
    this.status = 'expiring';
  } else if (this.quantity <= 20) {
    this.status = 'low';
  } else {
    this.status = 'active';
  }
  next();
});

export default mongoose.model<IProduct>('Product', ProductSchema);
