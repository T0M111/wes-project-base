import dotenv from 'dotenv';
import mongoose, { Types } from 'mongoose';
import connect from '@/lib/mongoose';
import Products, { Product } from '@/models/Product';
import Users, { User } from '@/models/User';

dotenv.config({ path: `.env.local`, override: true });
const MONGODB_URI = process.env.MONGODB_URI;

// (Opcional) asegura conexión única si usas este módulo en CLIs
if (!mongoose.connection.readyState && !MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

export interface GetProductsResponse {
  products: (Product & { _id: Types.ObjectId })[];
}

export interface CreateUserResponse {
  _id: Types.ObjectId;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

/** GET /products */
export async function getProducts(): Promise<GetProductsResponse> {
  await connect();

  // Mejor usa proyección con 0/1 o select, no "false"
  const products = await Products.find({}, { __v: 0 }); // o: .select('-__v')

  return {
    products: products as unknown as (Product & { _id: Types.ObjectId })[],
  };
}
export interface GetUserResponse
extends Pick<User, 'email' | 'name' | 'surname' | 'address' | 'birthdate'> {
_id: Types.ObjectId
}
export async function getUser(
userId: Types.ObjectId | string
): Promise<GetUserResponse | null> {
await connect()
const userProjection = {
email: true,
name: true,
surname: true,
address: true,
birthdate: true,
}
const user = await Users.findById(userId, userProjection)
return user
}

/** POST /users */
export async function createUser(user: {
  email: string;
  password: string;
  name: string;
  surname: string;
  address: string;
  birthdate: Date; // si viene como string, cambia a string y haz new Date(...)
}): Promise<CreateUserResponse | null> {
  await connect();

  // Más eficiente que find(): devuelve uno o null
  const existing = await Users.findOne({ email: user.email }).lean();
  if (existing) return null;

  const doc: User = {
    ...user,
    // si user.birthdate ya es Date, no hace falta new Date(user.birthdate)
    cartItems: [],
    orders: [],
  };

  const created = await Users.create(doc);

  return { _id: created._id as Types.ObjectId };
}
