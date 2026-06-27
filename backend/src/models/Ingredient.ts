import mongoose, { Document, Schema } from 'mongoose';

export interface IIngredient extends Document {
  name: string;
  description: string;
  category: string;
  createdAt: Date;
}

const IngredientSchema = new Schema<IIngredient>({
  name: {
    type: String,
    required: [true, 'Please provide an ingredient name'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'General',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IIngredient>('Ingredient', IngredientSchema);
