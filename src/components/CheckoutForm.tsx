'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface CheckoutFormProps {
  userId: string
  userAddress: string
}

export default function CheckoutForm({ userId, userAddress }: CheckoutFormProps) {
  const [address, setAddress] = useState(userAddress)
  const [cardHolder, setCardHolder] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/users/${userId}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          cardHolder,
          cardNumber,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert('Purchase completed successfully!')
        router.push(`/orders/${data._id}`)
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      alert('Error processing purchase')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label htmlFor='address' className='block text-sm font-medium text-gray-700'>
          Full Address
        </label>
        <input
          type='text'
          id='address'
          name='address'
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500'
          placeholder='123 Main St, 12345 City, Country'
          required
        />
      </div>

      <h4 className='pt-4 text-lg font-semibold text-gray-900'>Payment information</h4>

      <div>
        <label htmlFor='cardHolder' className='block text-sm font-medium text-gray-700'>
          Card Holder
        </label>
        <input
          type='text'
          id='cardHolder'
          name='cardHolder'
          value={cardHolder}
          onChange={(e) => setCardHolder(e.target.value)}
          className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500'
          placeholder='John Doe'
          required
        />
      </div>

      <div>
        <label htmlFor='cardNumber' className='block text-sm font-medium text-gray-700'>
          Card Number
        </label>
        <input
          type='text'
          id='cardNumber'
          name='cardNumber'
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500'
          placeholder='1234567890123456'
          required
        />
      </div>

      <button
        type='submit'
        disabled={isLoading}
        className='w-full rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400'
      >
        {isLoading ? 'Processing...' : 'Purchase'}
      </button>
    </form>
  )
}
