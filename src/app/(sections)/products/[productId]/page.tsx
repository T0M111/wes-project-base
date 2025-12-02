import { Types } from 'mongoose'
import { notFound } from 'next/navigation'
import { getProduct } from '@/lib/handlers'
import { getSession } from '@/lib/auth'
import AddToCartButton from '@/components/AddToCartButton'

export default async function Product({
  params,
}: {
  params: { productId: string }
}) {
  if (!Types.ObjectId.isValid(params.productId)) {
    notFound()
  }

  const product = await getProduct(params.productId)
  if (product === null) {
    notFound()
  }

  const session = await getSession()

  return (
    <div className='flex flex-col'>
      <div className='grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-2'>
        {/* Product Image */}
        <div className='aspect-h-3 aspect-w-4 overflow-hidden rounded-lg bg-gray-100'>
          {product.product.img ? (
            <img
              src={product.product.img}
              alt={product.product.name}
              className='h-full w-full object-cover object-center'
            />
          ) : (
            <div className='flex items-center justify-center text-gray-400'>
              No image available
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className='flex flex-col'>
          <h1 className='text-3xl font-bold text-gray-900'>{product.product.name}</h1>
          
          <p className='mt-4 text-3xl font-bold text-gray-900'>
            {product.product.price.toFixed(2)} €
          </p>

          {product.product.description && (
            <div className='mt-6'>
              <h2 className='text-lg font-semibold text-gray-900'>Product details</h2>
              <p className='mt-2 text-sm text-gray-600'>{product.product.description}</p>
            </div>
          )}

          {session ? (
            <AddToCartButton
              productId={params.productId}
              userId={session.userId}
            />
          ) : (
            <div className='mt-8 rounded-lg bg-gray-50 p-4 text-center'>
              <p className='text-sm text-gray-600'>
                Please sign in to add products to your cart
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}