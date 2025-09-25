import mongoose, { Schema, Types } from 'mongoose';

  export interface CartItem {
    product: Types.ObjectId;
    qty: number;
  }
  
  export interface Product {
    name: string;
    description: string;
    img: string;
    price: number;
  }

  const ProductSchema = new Schema<Product>({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  });
export default mongoose.models.Product as mongoose.Model<Product> || mongoose.model<Product>('Product', ProductSchema);