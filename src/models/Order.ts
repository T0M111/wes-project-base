import mongoose, { Schema, Types } from 'mongoose';

export interface OrderItem {
  product: Types.ObjectId;
  qty: number;
  price: number; // price at purchase time
}

export interface Order {
  user: Types.ObjectId; //no hace falta el id aqui, añadido de complejidad
  items: OrderItem[];
  // Optional metadata (some flows may not set these)
  address: string;
  date: Date;
  cardHolder: string;
  cardNumber: string;
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
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    address: { type: String, required: false },
    date: { type: Date, required: false, default: Date.now },
    cardHolder: { type: String, required: false },
    cardNumber: { type: String, required: false },
  });
const OrderModel =
  (mongoose.models.Order as mongoose.Model<Order>) ||
  mongoose.model<Order>('Order', OrderSchema);

export default OrderModel;