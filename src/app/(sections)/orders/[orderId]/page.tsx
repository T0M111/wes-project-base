import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Types } from 'mongoose'
import connect from '@/lib/mongoose'
import Orders from '@/models/Order'
import Link from 'next/link'

export default async function OrderDetails({
  params,
}: {
  params: { orderId: string }
}) {
  const session = await getSession()
  if (!session) {
    redirect('/auth/signin')
  }

  if (!Types.ObjectId.isValid(params.orderId)) {
    notFound()
  }

  await connect()

  const order = await Orders.findOne({
    _id: params.orderId,
    user: session.userId,
  }).populate({
    path: 'items.product',
    select: 'name price img description',
  })

  if (!order) {
    notFound()
  }

  const orderData = order.toObject() as unknown as {
    _id: Types.ObjectId
    user: Types.ObjectId
    items: Array<{
      product: {
        _id: Types.ObjectId
        name: string
        price: number
        img?: string
        description?: string
      }
      qty: number
      price?: number
    }>
    address?: string
    cardHolder?: string
    cardNumber?: string
    date?: Date
  }

  const total = orderData.items.reduce(
    (sum, item) => sum + (item.price || item.product.price) * item.qty,
    0
  )

  return (
    <div className='flex flex-col'>
      <h3 className='pb-4 text-3xl font-bold text-gray-900 sm:pb-6 lg:pb-8'>
        Order Details
      </h3>

      <div className='space-y-6'>
        {/* Order Information */}
        <div className='rounded-lg bg-gray-50 p-6'>
          <h4 className='mb-4 text-lg font-semibold text-gray-900'>Order Information</h4>
          <dl className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <dt className='text-sm font-medium text-gray-500'>Order ID</dt>
              <dd className='mt-1 text-sm text-gray-900'>{orderData._id.toString()}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-gray-500'>Date of purchase</dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {orderData.date
                  ? new Date(orderData.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-gray-500'>Shipping address</dt>
              <dd className='mt-1 text-sm text-gray-900'>{orderData.address || 'N/A'}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-gray-500'>Payment information</dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {orderData.cardHolder && orderData.cardNumber
                  ? `${orderData.cardHolder} - ${orderData.cardNumber}`
                  : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Order Items */}
        <div className='rounded-lg bg-white p-6 shadow'>
          <h4 className='mb-4 text-lg font-semibold text-gray-900'>Order Items</h4>
          <table className='w-full text-sm'>
            <thead className='border-b border-gray-300'>
              <tr className='text-left'>
                <th className='pb-2 font-semibold text-gray-700'>Product</th>
                <th className='pb-2 text-center font-semibold text-gray-700'>Quantity</th>
                <th className='pb-2 text-right font-semibold text-gray-700'>Price</th>
                <th className='pb-2 text-right font-semibold text-gray-700'>Total</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {orderData.items.map((item) => {
                const itemPrice = item.price || item.product.price
                return (
                  <tr key={item.product._id.toString()}>
                    <td className='py-3'>
                      <Link
                        href={`/products/${item.product._id.toString()}`}
                        className='text-gray-900 hover:text-gray-700'
                      >
                        {item.product.name}
                      </Link>
                    </td>
                    <td className='py-3 text-center text-gray-600'>{item.qty}</td>
                    <td className='py-3 text-right text-gray-600'>{itemPrice.toFixed(2)} €</td>
                    <td className='py-3 text-right font-medium text-gray-900'>
                      {(itemPrice * item.qty).toFixed(2)} €
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className='flex justify-between border-t border-gray-300 pt-4 text-lg font-bold'>
            <span>Total:</span>
            <span>{total.toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </div>
  )
}
