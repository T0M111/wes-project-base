import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connect from '@/lib/mongoose';

// 👇 importa los modelos para que se registren en Mongoose
import '@/models/Order';
import '@/models/Product';
import Users from '@/models/User';
import { ErrorResponse, postUserOrder, PostUserOrderResponse } from '@/lib/handlers';


// DTOs que devolvemos
type OrderProductDto = {
  _id: Types.ObjectId;
  name: string;
  price: number;
  img: string;
  description: string;
};
type OrderItemDto = { product: OrderProductDto; qty: number };
type OrderDto = { _id: Types.ObjectId; items: OrderItemDto[] };
type OrdersResponseBody = { orders: OrderDto[] };

// Shape real después del populate (para tipar sin any)
type PopulatedOrder = {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: { product: OrderProductDto | null; qty: number }[];
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse<OrdersResponseBody> | NextResponse<{ error: string; message: string }>> {
  const { userId } = params;

  if (!Types.ObjectId.isValid(userId)) {
    return NextResponse.json(
      { error: "WRONG_PARAMS", message: "Invalid user ID." },
      { status: 400 }
    );
  }

  try {
    console.log("👉 [orders] connect()");
    await connect();

    console.log("👉 [orders] findById + populate");
    const user = await Users.findById(userId)
      .populate({
        path: "orders",
        populate: { path: "items.product", select: "name price img description" },
      })
      .select("_id orders")
      .lean<{ _id: Types.ObjectId; orders?: PopulatedOrder[] }>();

    if (!user) {
      console.warn("❌ [orders] user not found");
      return NextResponse.json({ error: "NOT_FOUND", message: "User not found." }, { status: 404 });
    }

    if (!user.orders || user.orders.length === 0) {
      console.log("ℹ️ [orders] user has no orders");
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    console.log("👉 [orders] mapping", user.orders.length, "orders");
    const orders: OrderDto[] = user.orders.map((ord) => ({
      _id: ord._id,
      items: ord.items
        .filter((it) => it.product) // evita nulos si borraron un producto
        .map((it) => ({
          product: it.product as OrderProductDto,
          qty: it.qty,
        })),
    }));

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("💥 [orders] internal error:", err);
    // te devuelve el mensaje real para debug (cámbialo por genérico en prod)
    return NextResponse.json(
      { error: "INTERNAL", message: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse<PostUserOrderResponse> | NextResponse<ErrorResponse>> {
  const { userId } = params
  const body = await request.json()

  // 🔹 Validar body
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      {
        error: 'WRONG_PARAMS',
        message: 'Request parameters are wrong or missing.',
      },
      { status: 400 }
    )
  }

  // 🔹 Intentar crear la orden
  const created = await postUserOrder(userId, body)

  // 🔹 Usuario no encontrado
  if (created === null) {
    return NextResponse.json(
      {
        error: 'NOT_FOUND',
        message: `User with ID ${userId} not found.`,
      },
      { status: 404 }
    )
  }

  // 🔹 Orden creada correctamente
  const headers = new Headers()
  headers.append('Location', `/api/users/${userId}/orders/${created._id}`)

  return NextResponse.json(created, { status: 201, headers })
}