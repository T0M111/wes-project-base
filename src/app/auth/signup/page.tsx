import SignUpForm from '@/components/SignUpForm'

export default function SignUpPage() {
  return (
    <div className='flex h-screen items-center justify-center bg-gray-900'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-white'>
            Create an account
          </h2>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}
