import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { RegisterForm } from './RegisterForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Create account' }

export default async function RegisterPage() {
  const session = await getSession()
  if (session) redirect('/')

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="mb-8 text-center">
        <span className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          North
        </span>
      </div>

      <div
        className="w-full max-w-sm rounded-[var(--radius-dialog)] p-8"
        style={{
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-dialog)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div className="mb-7">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Create your account
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Get started with North.
          </p>
        </div>

        <RegisterForm />

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Already have an account?{' '}
          <a
            href="/login"
            className="font-medium hover:underline"
            style={{ color: 'var(--color-brand)' }}
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
