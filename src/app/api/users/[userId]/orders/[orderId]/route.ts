import { NextRequest, NextResponse } from 'next/server'
import { Types } from 'mongoose'
import connect from '@/lib/mongoose'
import Users from '@/models/User'
import Orders from '@/models/Order'

type ProductShape = {
	_id: Types.ObjectId
	name: string
	price: number
	img: string
	description: string
}

type OrderItemResponse = {
	product: ProductShape
	qty: number
	price: number
}

type OrderResponseBody = {
	_id: Types.ObjectId
	address?: string
	date?: Date
	cardHolder?: string
	cardNumber?: string
	orderItems: OrderItemResponse[]
}

export async function GET(
	_request: NextRequest,
	{ params }: { params: { userId: string; orderId: string } }
): Promise<
	| NextResponse<OrderResponseBody>
	| NextResponse<{ error: string; message: string }>
> {
	const { userId, orderId } = params

	// Validate IDs
	if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(orderId)) {
		return NextResponse.json(
			{ error: 'WRONG_PARAMS', message: 'Invalid user ID or order ID.' },
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

	// Find order belonging to this user and populate items.product
	const orderDoc = await Orders.findOne({ _id: orderId, user: userId }).populate({
		path: 'items.product',
		select: '-__v',
	})

	if (!orderDoc) {
		return NextResponse.json(
			{ error: 'NOT_FOUND', message: 'Order not found.' },
			{ status: 404 }
		)
	}

	// Build response mapping
	const anyOrder = orderDoc as unknown as {
		_id: Types.ObjectId
		address?: string
		date?: Date
		cardHolder?: string
		cardNumber?: string
		items: { product: ProductShape | null; qty: number; price?: number }[]
	}

	const orderItems: OrderItemResponse[] = (anyOrder.items || [])
		.filter((i) => i.product !== null)
		.map((i) => ({
			product: i.product as ProductShape,
			qty: i.qty,
			// If the order schema has a stored price per item, use it; otherwise fall back to current product price
			price: typeof i.price === 'number' ? i.price : (i.product as ProductShape).price,
		}))

	const response: OrderResponseBody = {
		_id: anyOrder._id,
		address: anyOrder.address,
		date: anyOrder.date,
		cardHolder: anyOrder.cardHolder,
		cardNumber: anyOrder.cardNumber,
		orderItems,
	}

	return NextResponse.json(response)
}

