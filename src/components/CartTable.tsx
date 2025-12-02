'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CartItem {
  product: {
    _id: string
    name: string
    price: number
    img?: string
  }
  qty: number
}

interface CartTableProps {
  items: CartItem[]
  userId: string
}

export default function CartTable({ items, userId }: CartTableProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const updateQuantity = async (productId: string, newQty: number) => {
    if (newQty < 1) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qty: newQty }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      alert('Error updating quantity')
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = async (productId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/cart/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      alert('Error removing item')
    } finally {
      setIsLoading(false)
    }
  }

  const total = items.reduce((sum, item) => sum + item.product.price * item.qty, 0)

  return (
    <div className='space-y-6'>
      <div className='rounded-lg bg-white shadow'>
        <table className='w-full text-sm'>
          <thead className='border-b border-gray-300 bg-gray-50'>
            <tr className='text-left'>
              <th className='px-6 py-3 font-semibold text-gray-700'>Product</th>
              <th className='px-6 py-3 text-center font-semibold text-gray-700'>Quantity</th>
              <th className='px-6 py-3 text-right font-semibold text-gray-700'>Price</th>
              <th className='px-6 py-3 text-right font-semibold text-gray-700'>Total</th>
              <th className='px-6 py-3'></th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {items.map((cartItem) => (
              <tr key={cartItem.product._id}>
                <td className='px-6 py-4'>
                  <Link
                    href={`/products/${cartItem.product._id}`}
                    className='flex items-center space-x-4 text-gray-900 hover:text-gray-700'
                  >
                    {cartItem.product.img && (
                      <img
                        src={cartItem.product.img}
                        alt={cartItem.product.name}
                        className='h-16 w-16 rounded object-cover'
                      />
                    )}
                    <span className='font-medium'>{cartItem.product.name}</span>
                  </Link>
                </td>
                <td className='px-6 py-4 text-center'>
                  <div className='flex items-center justify-center space-x-2'>
                    <button
                      onClick={() => updateQuantity(cartItem.product._id, cartItem.qty - 1)}
                      disabled={isLoading || cartItem.qty <= 1}
                      className='rounded border border-gray-300 px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400'
                    >
                      -
                    </button>
                    <span className='w-8 text-center'>{cartItem.qty}</span>
                    <button
                      onClick={() => updateQuantity(cartItem.product._id, cartItem.qty + 1)}
                      disabled={isLoading}
                      className='rounded border border-gray-300 px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:bg-gray-100'
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className='px-6 py-4 text-right text-gray-600'>
                  {cartItem.product.price.toFixed(2)} €
                </td>
                <td className='px-6 py-4 text-right font-medium text-gray-900'>
                  {(cartItem.product.price * cartItem.qty).toFixed(2)} €
                </td>
                <td className='px-6 py-4 text-right'>
                  <button
                    onClick={() => removeItem(cartItem.product._id)}
                    disabled={isLoading}
                    className='text-red-600 hover:text-red-800 disabled:text-red-300'
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='rounded-lg bg-gray-50 p-6'>
        <div className='flex items-center justify-between text-lg font-bold'>
          <span>Total:</span>
          <span>{total.toFixed(2)} €</span>
        </div>
        <Link
          href='/checkout'
          className='mt-4 block w-full rounded-md bg-gray-800 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-gray-700'
        >
          Check out
        </Link>
      </div>
    </div>
  )
}
