import mongoose, { Document, Schema } from 'mongoose';

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

const RecommendedProductSchema = new Schema<IRecommendedProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Cleanser', 'Serum', 'Moisturizer', 'Sunscreen', 'Eye Care', 'Lip Care', 'Exfoliator', 'Toner', 'Mask', 'Treatment'],
  },
  ingredients: {
    type: String,
    required: true,
  },
  skinTypes: [{
    type: String,
    enum: ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'],
  }],
  skinConcerns: [{
    type: String,
    enum: [
      'Acne', 'Pigmentation', 'Dark Spots', 'Dry Lips', 'Blackheads',
      'Whiteheads', 'Large Pores', 'Redness', 'Fine Lines', 'Wrinkles',
      'Dullness', 'Under-eye Dark Circles'
    ],
  }],
  timeOfDay: {
    type: String,
    enum: ['Morning', 'Night', 'Both'],
    default: 'Both',
  },
  description: {
    type: String,
    default: '',
  },
  howToUse: {
    type: String,
    default: '',
  },
  whyRecommended: {
    type: String,
    default: '',
  },
});

RecommendedProductSchema.index({ skinTypes: 1, skinConcerns: 1 });
RecommendedProductSchema.index({ category: 1, skinTypes: 1 });

export default mongoose.model<IRecommendedProduct>('RecommendedProduct', RecommendedProductSchema);
