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
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validateCardNumber = (cardNum: string): boolean => {
    // Remove spaces and non-digits
    const cleanCardNum = cardNum.replace(/\s/g, '')
    // Check if it's 13-19 digits (valid credit card length)
    return /^\d{13,19}$/.test(cleanCardNum)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validation
    if (!address.trim()) {
      setError('Address is required.')
      setIsLoading(false)
      return
    }

    if (!cardHolder.trim()) {
      setError('Card holder name is required.')
      setIsLoading(false)
      return
    }

    if (!cardNumber.trim()) {
      setError('Card number is required.')
      setIsLoading(false)
      return
    }

    if (!validateCardNumber(cardNumber)) {
      setError('Card number must be between 13 and 19 digits.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address.trim(),
          cardHolder: cardHolder.trim(),
          cardNumber: cardNumber.replace(/\s/g, ''),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/orders/${data._id}`)
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to complete purchase. Please try again.')
      }
    } catch (err) {
      setError('An error occurred while processing your purchase.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {error && (
        <div className='rounded-md bg-red-50 p-4'>
          <p className='text-sm font-medium text-red-800'>{error}</p>
        </div>
      )}

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
          placeholder='1234 5678 9012 3456'
          required
        />
        <p className='mt-1 text-xs text-gray-500'>13-19 digits required</p>
      </div>

      <button
        type='submit'
        disabled={isLoading || !address.trim() || !cardHolder.trim() || !cardNumber.trim()}
        className='w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed'
      >
        {isLoading ? 'Processing...' : 'Purchase'}
      </button>
    </form>
  )
}
