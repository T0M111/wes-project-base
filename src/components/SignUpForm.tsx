'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpForm() {
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [address, setAddress] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          surname,
          email,
          password,
          address,
          birthdate,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || 'Registration failed. Please try again.')
        setLoading(false)
        return
      }

      // Success - redirect to sign-in page
      router.push('/auth/signin')
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form className='space-y-6' onSubmit={handleSubmit}>
      {error && (
        <div className='rounded-md bg-red-50 p-4'>
          <p className='text-sm font-medium text-red-800'>{error}</p>
        </div>
      )}

      <div>
        <label htmlFor='name' className='block text-sm font-medium text-gray-300'>
          Name
        </label>
        <input
          id='name'
          name='name'
          type='text'
          autoComplete='given-name'
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='mt-1 block w-full appearance-none rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
          placeholder='John'
        />
      </div>

      <div>
        <label htmlFor='surname' className='block text-sm font-medium text-gray-300'>
          Surname
        </label>
        <input
          id='surname'
          name='surname'
          type='text'
          autoComplete='family-name'
          required
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          className='mt-1 block w-full appearance-none rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
          placeholder='Doe'
        />
      </div>

      <div>
        <label htmlFor='email' className='block text-sm font-medium text-gray-300'>
          Email address
        </label>
        <input
          id='email'
          name='email'
          type='email'
          autoComplete='email'
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='mt-1 block w-full appearance-none rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
          placeholder='john@example.com'
        />
      </div>

      <div>
        <label htmlFor='password' className='block text-sm font-medium text-gray-300'>
          Password
        </label>
        <input
          id='password'
          name='password'
          type='password'
          autoComplete='new-password'
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='mt-1 block w-full appearance-none rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
          placeholder='••••••••'
        />
      </div>

      <div>
        <label htmlFor='address' className='block text-sm font-medium text-gray-300'>
          Address
        </label>
        <input
          id='address'
          name='address'
          type='text'
          autoComplete='street-address'
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className='mt-1 block w-full appearance-none rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
          placeholder='123 Main St, City, Country'
        />
      </div>

      <div>
        <label htmlFor='birthdate' className='block text-sm font-medium text-gray-300'>
          Birthdate
        </label>
        <input
          id='birthdate'
          name='birthdate'
          type='date'
          autoComplete='bday'
          required
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className='mt-1 block w-full appearance-none rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
        />
      </div>

      <button
        type='submit'
        disabled={loading}
        className='group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50'
      >
        {loading ? 'Creating account...' : 'Sign up'}
      </button>

      <div className='text-center'>
        <p className='text-sm text-gray-400'>
          Already have an account?{' '}
          <Link href='/auth/signin' className='font-medium text-blue-400 hover:text-blue-300'>
            Sign in
          </Link>
        </p>
      </div>
    </form>
  )
}
