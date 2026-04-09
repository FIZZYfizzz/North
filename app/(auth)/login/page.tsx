import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { LoginForm } from './LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage() {
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
            Welcome back
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sign in to continue.
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Don't have an account?{' '}
          <a
            href="/register"
            className="font-medium hover:underline"
            style={{ color: 'var(--color-brand)' }}
          >
            Register
          </a>
        </p>
      </div>
    </div>
  )
}
