import Products, { Product } from '@/models/Product';
import Users, { User } from '@/models/User';
import Orders from '@/models/Order';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: `.env.local`, override: true });
const MONGODB_URI = process.env.MONGODB_URI;

const products: Product[] = [
  {
    name: 'Canción de Hielo y Fuego',
    price: 29.95,
    img: 'https://imgs.search.brave.com/u2y3CfjhnRvXbI4_R8m6_8jUcVA79CtWgNgduTM0dx8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS52YW5kYWwubmV0/L2kvNjIweDQ0Mi81/LTIwMjIvMjAyMjUx/OTE0MjYxNDU0XzIu/anBn',
    description: 'What a book!',
  },
  {
    name: 'El paciente',
    price: 20.95,
    img: 'https://imgs.search.brave.com/83nbE_m_68Lnr5wmXpPc7uFHla6awN90jWUoISOQKh4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9odHRw/Mi5tbHN0YXRpYy5j/b20vRF9RX05QXzJY/XzYwNTk3Mi1NTEE3/MDE5NTA4MTMzMV8w/NjIwMjMtVi53ZWJw',
    description: 'Great book!',
  },
];

async function seed() {
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }

  const opts = {
    bufferCommands: false,
  };
  const conn = await mongoose.connect(MONGODB_URI, opts);

  if (conn.connection.db) {
    await conn.connection.db.dropDatabase();
  } else {
    throw new Error('Database connection is undefined.');
  }

  // Create empty collections
  await Products.createCollection();
  await Users.createCollection();
  await Orders.createCollection(); // Optional: only if you have an Order model
  
  const insertedProducts = await Products.insertMany(products);
  
  const user: User = {
    email: 'johndoe@example.com',
    password: '1234',
    name: 'John',
    surname: 'Doe',
    address: '123 Main St, 12345 New York, United States',
    birthdate: new Date('1970-01-01'),
    cartItems: [
      {
        product: insertedProducts[0]._id,
        qty: 2,
      },
      {
        product: insertedProducts[1]._id,
        qty: 5,
      },
    ],
    orders: [],
  };
  const res = await Users.create(user);
  console.log(JSON.stringify(res, null, 2));

const userProjection = {
  name: true,
  surname: true,
};
const productProjection = {
  name: true,
  price: true,
};
const retrievedUser = await Users
  .findOne({ email: 'johndoe@example.com' }, userProjection)
  .populate('cartItems.product', productProjection);
console.log(JSON.stringify(retrievedUser, null, 2));
  await conn.disconnect();
}

seed().catch(console.error);