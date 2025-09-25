import mongoose, { Schema, Types } from 'mongoose';

  export interface CartItem {
    product: Types.ObjectId;
    qty: number;
  }
  
  export interface Order {
    user: Types.ObjectId;
    items: CartItem[];
  }

  const OrderSchema = new Schema<Order>({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        qty: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  });
export default mongoose.models.Order as mongoose.Model<Order> || mongoose.model<Order>('Order', OrderSchema);