import { redirect } from 'next/navigation'
import { getUserProducts } from '@/lib/handlers'
import { getSession } from '@/lib/auth'
import CartTable from '@/components/CartTable'

export default async function Cart() {
  const session = await getSession()
  if (!session) {
    redirect('/auth/signin')
  }

  const cartItemsData = await getUserProducts(session.userId)
  if (!cartItemsData) {
    redirect('/auth/signin')
  }

  const cartItems = cartItemsData.items.map((item) => ({
    product: {
      _id: item.product._id.toString(),
      name: item.product.name,
      price: item.product.price,
      img: item.product.img,
    },
    qty: item.qty,
  }))

  return (
    <div className='flex flex-col'>
      <h3 className='pb-4 text-3xl font-bold text-gray-900 sm:pb-6 lg:pb-8'>
        My Shopping Cart
      </h3>
      
      {cartItems.length === 0 ? (
        <div className='rounded-lg bg-gray-50 p-8 text-center'>
          <p className='text-sm text-gray-500'>The cart is empty</p>
        </div>
      ) : (
        <CartTable items={cartItems} userId={session.userId} />
      )}
    </div>
  )
}