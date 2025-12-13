'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export const navbarButtonClasses =
  'rounded-full p-2 text-gray-400 hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-white';

interface NavbarSignOutButtonProps {
  children: ReactNode;
}

export default function NavbarSignOutButton({ children }: NavbarSignOutButtonProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      })

      if (response.ok) {
        router.refresh()
        router.push('/')
      }
    } catch (err) {
      console.error('Sign out failed:', err)
    }
  }

  return (
    <button onClick={handleSignOut} className={navbarButtonClasses}>
      {children}
    </button>
  )
}
