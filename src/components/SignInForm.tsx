'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/singin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || 'Login failed. Please try again.')
        setLoading(false)
        return
      }

      // Success - refresh to load session and redirect to home page
      router.refresh()
      router.push('/')
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
          autoComplete='current-password'
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='mt-1 block w-full appearance-none rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
          placeholder='••••••••'
        />
      </div>

      <button
        type='submit'
        disabled={loading}
        className='group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50'
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      <div className='text-center'>
        <p className='text-sm text-gray-400'>
          {"Don't have an account?"}
          <Link href='/auth/signup' className='font-medium text-blue-400 hover:text-blue-300'>
            Sign up
          </Link>
        </p>
      </div>
    </form>
  )
}
