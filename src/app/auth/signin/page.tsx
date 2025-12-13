import SignInForm from '@/components/SignInForm'

export default function SignInPage() {
  return (
    <div className='flex h-screen items-center justify-center bg-gray-900'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-white'>
            Sign in to your account
          </h2>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
