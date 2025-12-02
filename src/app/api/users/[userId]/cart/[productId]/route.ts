import { NextRequest, NextResponse } from 'next/server'
import { Types } from 'mongoose'
import connect from '@/lib/mongoose'
import Users from '@/models/User'
import Products from '@/models/Product'
import { getSession } from '@/lib/auth'

type CartItemProduct = {
  _id: Types.ObjectId
  name: string
  price: number
  img: string
  description: string
}

type CartItemResponse = {
  product: CartItemProduct
  qty: number
}

type CartResponseBody = {
  cartItems: CartItemResponse[]
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string; productId: string } }
): Promise<
  | NextResponse<CartResponseBody>
  | NextResponse<{ error: string; message: string }>
> {
  const { userId, productId } = params

  // Authentication & authorization
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'NOT_AUTHENTICATED', message: 'Authentication required.' }, { status: 401 })
  }
  if (session.userId.toString() !== userId) {
    return NextResponse.json({ error: 'NOT_AUTHORIZED', message: 'Unauthorized access.' }, { status: 403 })
  }

  // Validate IDs
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId)) {
    return NextResponse.json(
      { error: 'WRONG_PARAMS', message: 'Invalid user ID or product ID.' },
      { status: 400 }
    )
  }

  let body: { qty?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'WRONG_PARAMS', message: 'Invalid JSON body.' },
      { status: 400 }
    )
  }

  const qty = typeof body.qty === 'number' ? body.qty : Number(body.qty)
  if (!Number.isInteger(qty) || qty <= 0) {
    return NextResponse.json(
      {
        error: 'WRONG_PARAMS',
        message: 'Quantity must be an integer greater than 0.',
      },
      { status: 400 }
    )
  }

  await connect()

  // Ensure user exists
  const user = await Users.findById(userId)
  if (!user) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'User not found.' },
      { status: 404 }
    )
  }

  // Ensure product exists
  const productExists = await Products.exists({ _id: productId })
  if (!productExists) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'Product not found.' },
      { status: 404 }
    )
  }

  // Try to update existing cart item
  const updatedUserIfExists = await Users.findOneAndUpdate(
    { _id: userId, 'cartItems.product': productId },
    { $set: { 'cartItems.$.qty': qty } },
    { new: true }
  )

  let status = 200
  let updatedUserDoc = updatedUserIfExists

  // If it wasn't in the cart, push a new entry
  if (!updatedUserDoc) {
    updatedUserDoc = await Users.findByIdAndUpdate(
      userId,
      { $push: { cartItems: { product: new Types.ObjectId(productId), qty } } },
      { new: true }
    )
    status = 201
  }

  // Populate product details for response (Mongoose v7+)
  const finalUser = await Users.findById(userId).populate({
    path: 'cartItems.product',
    select: '-__v',
  })

  const fu = finalUser as unknown as
    | { cartItems: { product: CartItemProduct | null; qty: number }[] }
    | null

  const responseBody: CartResponseBody = {
    cartItems:
      fu?.cartItems
        .filter((i) => i.product !== null)
        .map((i) => ({
          product: i.product as CartItemProduct,
          qty: i.qty,
        })) ?? [],
  }

  const headers = new Headers()
  if (status === 201) {
    headers.set('Location', `/api/users/${userId}/cart/${productId}`)
  }

  return NextResponse.json(responseBody, { status, headers })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { userId: string; productId: string } }
): Promise<
  | NextResponse<CartResponseBody>
  | NextResponse<{ error: string; message: string }>
> {
  const { userId, productId } = params

  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'NOT_AUTHENTICATED', message: 'Authentication required.' }, { status: 401 })
  }
  if (session.userId.toString() !== userId) {
    return NextResponse.json({ error: 'NOT_AUTHORIZED', message: 'Unauthorized access.' }, { status: 403 })
  }

  // Validate IDs
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId)) {
    return NextResponse.json(
      { error: 'WRONG_PARAMS', message: 'Invalid user ID or product ID.' },
      { status: 400 }
    )
  }

  await connect()

  // Ensure user exists
  const user = await Users.findById(userId)
  if (!user) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'User not found.' },
      { status: 404 }
    )
  }

  // Ensure product exists
  const productExists = await Products.exists({ _id: productId })
  if (!productExists) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'Product not found.' },
      { status: 404 }
    )
  }

  // Remove cart item if present
  await Users.updateOne(
    { _id: userId },
    { $pull: { cartItems: { product: new Types.ObjectId(productId) } } }
  )

  // Return populated cart
  const finalUser = await Users.findById(userId).populate({
    path: 'cartItems.product',
    select: '-__v',
  })

  if (!finalUser) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'User not found.' },
      { status: 404 }
    )
  }

  const responseBody: CartResponseBody = {
    cartItems: finalUser.cartItems
      .filter((i) => i.product !== null)
      .map((i) => ({
        product: i.product as unknown as CartItemProduct,
        qty: i.qty,
      })),
  }

  return NextResponse.json(responseBody, { status: 200 })
}
