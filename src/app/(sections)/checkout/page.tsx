import { redirect } from 'next/navigation'
import { getUserProducts, getUser } from '@/lib/handlers'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import CheckoutForm from '@/components/CheckoutForm'

export default async function Checkout() {
  const session = await getSession()
  if (!session) {
    redirect('/auth/signin')
  }

  const cartItemsData = await getUserProducts(session.userId)
  if (!cartItemsData) {
    redirect('/auth/signin')
  }

  const user = await getUser(session.userId)
  if (!user) {
    redirect('/auth/signin')
  }

  const total = cartItemsData.items.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  )

  return (
    <div className='flex flex-col'>
      <h3 className='pb-4 text-3xl font-bold text-gray-900 sm:pb-6 lg:pb-8'>
        Checkout
      </h3>
      
      {cartItemsData.items.length === 0 ? (
        <div className='rounded-lg bg-gray-50 p-6 text-center'>
          <p className='text-sm text-gray-500'>Your cart is empty</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-2'>
          {/* Cart Summary */}
          <div className='rounded-lg bg-gray-50 p-6'>
            <h4 className='mb-4 text-lg font-semibold text-gray-900'>Order Summary</h4>
            <div className='space-y-4'>
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
                  {cartItemsData.items.map((item) => (
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
                      <td className='py-3 text-right text-gray-600'>
                        {item.product.price.toFixed(2)} €
                      </td>
                      <td className='py-3 text-right font-medium text-gray-900'>
                        {(item.product.price * item.qty).toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className='flex justify-between border-t border-gray-300 pt-4 text-lg font-bold'>
                <span>Total:</span>
                <span>{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className='rounded-lg bg-white p-6 shadow'>
            <h4 className='mb-4 text-lg font-semibold text-gray-900'>Shipping address</h4>
            <CheckoutForm userId={session.userId} userAddress={user.address} />
          </div>
        </div>
      )}
    </div>
  )
}
