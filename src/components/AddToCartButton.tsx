'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AddToCartButtonProps {
  productId: string
  userId: string
}

export default function AddToCartButton({ productId, userId }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qty: quantity }),
      })

      if (response.ok) {
        router.refresh()
        alert('Product added to cart!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      alert('Error adding product to cart')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='mt-8 space-y-4'>
      <div className='flex items-center space-x-4'>
        <label className='text-sm font-medium text-gray-700'>Quantity:</label>
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className='rounded border border-gray-300 px-3 py-1 text-gray-600 hover:bg-gray-100'
            disabled={isLoading}
          >
            -
          </button>
          <span className='w-12 text-center'>{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className='rounded border border-gray-300 px-3 py-1 text-gray-600 hover:bg-gray-100'
            disabled={isLoading}
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isLoading}
        className='w-full rounded-md bg-gray-800 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400'
      >
        {isLoading ? 'Adding...' : 'Add to cart'}
      </button>
    </div>
  )
}
