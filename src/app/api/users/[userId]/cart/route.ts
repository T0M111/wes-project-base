import { NextRequest, NextResponse } from 'next/server'
import { Types } from 'mongoose'
import connect from '@/lib/mongoose'
import Users from '@/models/User'

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

export async function GET(
	_request: NextRequest,
	{ params }: { params: { userId: string } }
): Promise<
	| NextResponse<CartResponseBody>
	| NextResponse<{ error: string; message: string }>
> {
	const { userId } = params

	if (!Types.ObjectId.isValid(userId)) {
		return NextResponse.json(
			{ error: 'WRONG_PARAMS', message: 'Invalid user ID.' },
			{ status: 400 }
		)
	}

	await connect()

	const user = await Users.findById(userId).populate({
		path: 'cartItems.product',
		select: '-__v',
	})

	if (!user) {
		return NextResponse.json(
			{ error: 'NOT_FOUND', message: 'User not found.' },
			{ status: 404 }
		)
	}

	const response: CartResponseBody = {
		cartItems: user.cartItems
			.filter((i) => i.product !== null)
			.map((i) => ({
				product: i.product as unknown as CartItemProduct,
				qty: i.qty,
			})),
	}

	return NextResponse.json(response)
}

