import dotenv from 'dotenv';
import mongoose, { Types } from 'mongoose';
import connect from '@/lib/mongoose';
import Products, { Product } from '@/models/Product';
import Users, { User } from '@/models/User';
import Orders, { Order } from '@/models/Order';
import bcrypt from 'bcrypt'

dotenv.config({ path: `.env.local`, override: true });
const MONGODB_URI = process.env.MONGODB_URI;



// (Opcional) asegura conexión única si usas este módulo en CLIs
if (!mongoose.connection.readyState && !MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

export interface GetCartItemResponse {
  product: Product & { _id: Types.ObjectId };
  qty: number;
}
export interface GetCartResponse {
  items: GetCartItemResponse[];
}
export interface GetProductsResponse {
  products: (Product & { _id: Types.ObjectId })[];
}
export interface GetProductResponse {
  product: Product & { _id: Types.ObjectId };
}

export interface CreateUserResponse {
  _id: Types.ObjectId;
}
export interface PostUserOrderResponse {
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


/** GET /products/:productId */
export async function getProduct(productId: string): Promise<GetProductResponse | null> {
  await connect();

  // Mejor usa proyección con 0/1 o select, no "false"
  const product = await Products.findById(productId, { __v: 0 }); // o: .select('-__v')
  return product ? { product } : null;
}
export interface GetUserResponse
extends Pick<User, 'email' | 'name' | 'surname' | 'address' | 'birthdate'> {
_id: Types.ObjectId
}
export async function getUser( userId: Types.ObjectId | string ):
 Promise<GetUserResponse | null> {
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

//Hacer un get users cart item filtrado por id de usuario que lo que hace es que te devuelva los productos del carrito con sus datos
export async function getUserProducts(userId: Types.ObjectId | string): Promise<GetCartResponse | null> {
  await connect();
  
  const user = await Users.findById(userId)
    .populate({
      path: 'cartItems.product',
      select: '-__v'
    });

  if (!user) return null;

  return {
    items: user.cartItems
      .filter(item => item.product !== null)
      .map(item => ({
        product: item.product as unknown as Product & { _id: Types.ObjectId },
        qty: item.qty
      }))
  };
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
  // Normalizar email y comprobar existencia
  const normalizedEmail = user.email.trim().toLowerCase();
  // Más eficiente que find(): devuelve uno o null
  const existing = await Users.findOne({ email: normalizedEmail }).lean();
  if (existing) return null;

  // Hash de la contraseña
  const hash = await bcrypt.hash(user.password, 10);
  const doc: User = {
    email: normalizedEmail,
    password: hash,
    name: user.name,
    surname: user.surname,
    address: user.address,
    // Asegurar que birthdate se almacena como Date
    birthdate: new Date(user.birthdate),
    cartItems: [],
    orders: [],
  };

  const created = await Users.create(doc);

  return { _id: created._id as Types.ObjectId };
}
//GET /users/:userId/Orders
export interface GetOrderResponse {
  orders: {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    items: {
      product: Product & { _id: Types.ObjectId };
      qty: number;
    }[];
  }[];
}

export async function getUserOrders(userId: Types.ObjectId |
   string): Promise<GetOrderResponse | null> {
  await connect();
  
  const user = await Users.findById(userId)
    .populate({
      path: 'orders',
      populate: { path: 'items.product', model: 'Product', select: '-__v' }
    });
  if (!user) return null;

// forzar el tipo localmente porque User.orders en el modelo sigue declarado como ObjectId[]
const orders = (user.orders as unknown as (Order & { _id: Types.ObjectId })[]).map(order => ({
  _id: order._id,
  user: order.user,
  items: order.items.map(item => ({
    product: item.product as unknown as Product & { _id: Types.ObjectId },
    qty: item.qty,
  })),
}));

return { orders };
}
export async function postUserOrder(
  userId: Types.ObjectId | string,
  order: {
    items: { product: Types.ObjectId; qty: number }[];//quitar de parametros opcionales
    address: string;
    cardHolder: string;
    cardNumber: string;
  }
): Promise<PostUserOrderResponse | string> {
  await connect();

  // 🔹 Validación: ID válido
  if (!userId || !Types.ObjectId.isValid(userId)) {
    console.warn('[postUserOrder] Invalid user ID:', userId);
    return "user no valido";
  }
  const productIds = order.items.map((i) => i.product);
  const products = await Products.find(
    { _id: { $in: productIds } },
    { _id: 1, price: 1 }
  ).lean<{ _id: Types.ObjectId; price: number }[]>();
  const priceMap = new Map<string, number>(
    products.map((p) => [p._id.toString(), p.price])
  );
  // Validate all products exist
  for (const item of order.items) {
    if (!priceMap.has(item.product.toString())) {
      console.warn('[postUserOrder] Invalid order item:', item);
      return 'product not found';
    }
  }

  // 🔹 Conversión segura a ObjectId
  const uid = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

  // 🔹 Verificar que el usuario existe
  const user = await Users.findById(uid);
  if (!user) {
    console.warn('[postUserOrder] User not found:', userId);
    return "user not found";
  }

  const newOrder: Partial<Order> & { user: Types.ObjectId; items: { product: Types.ObjectId; qty: number; price: number }[]; date: Date } = {
    user: uid,
    items: order.items.map((item) => ({
      product: item.product,
      qty: item.qty,
      price: priceMap.get(item.product.toString()) as number,
    })),
    address: order.address,
    cardHolder: order.cardHolder,
    cardNumber: order.cardNumber,
    date: new Date(),
  };

  const createdOrder = await Orders.create(newOrder);
  user.orders.push(createdOrder._id);
  await user.save();

  return { _id: createdOrder._id as Types.ObjectId };


}
export interface CheckCredentialsResponse {
  _id: Types.ObjectId;
}
export async function checkCredentials(
email: string,
password: string
): Promise<CheckCredentialsResponse | null> {
  await connect();
  const normalizedEmail = email.trim().toLowerCase();
  const user = await Users.findOne({email: normalizedEmail })//.select('+password ');
   if (!user) return null;
  const match = await bcrypt.compare(password, user.password);
  if (!match) return null;

  
  return { _id: user._id as Types.ObjectId };
}
