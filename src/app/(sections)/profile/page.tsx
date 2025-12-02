import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getUser, getUserOrders } from '@/lib/handlers'
import Link from 'next/link'

export default async function Profile() {
  const session = await getSession()
  if (!session) {
    redirect('/auth/signin')
  }

  const user = await getUser(session.userId)
  const ordersData = await getUserOrders(session.userId)

  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div className='flex flex-col space-y-8'>
      <div>
        <h3 className='pb-4 text-3xl font-bold text-gray-900 sm:pb-6 lg:pb-8'>
          User Profile
        </h3>
        
        <div className='rounded-lg bg-gray-50 p-6'>
          <dl className='grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2'>
            <div>
              <dt className='text-sm font-medium text-gray-500'>Full name</dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {user.name} {user.surname}
              </dd>
            </div>
            
            <div>
              <dt className='text-sm font-medium text-gray-500'>Email address</dt>
              <dd className='mt-1 text-sm text-gray-900'>{user.email}</dd>
            </div>
            
            <div>
              <dt className='text-sm font-medium text-gray-500'>Address</dt>
              <dd className='mt-1 text-sm text-gray-900'>{user.address}</dd>
            </div>
            
            <div>
              <dt className='text-sm font-medium text-gray-500'>Birthdate</dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {new Date(user.birthdate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div>
        <h4 className='pb-4 text-2xl font-bold text-gray-900'>Orders</h4>
        
        {!ordersData || ordersData.orders.length === 0 ? (
          <div className='rounded-lg bg-gray-50 p-6 text-center'>
            <p className='text-sm text-gray-500'>No orders yet</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {ordersData.orders.map((order) => (
              <Link
                key={order._id.toString()}
                href={`/orders/${order._id.toString()}`}
                className='block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:border-gray-300 hover:shadow'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-900'>
                      Order ID: {order._id.toString()}
                    </p>
                    <p className='mt-1 text-sm text-gray-500'>
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm font-semibold text-gray-900'>
                      {order.items
                        .reduce((sum, item) => sum + item.product.price * item.qty, 0)
                        .toFixed(2)}{' '}
                      €
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
