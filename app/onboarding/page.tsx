import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { OnboardingForm } from './OnboardingForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Create your workspace' }

export default async function OnboardingPage() {
  const session = await getSession()
  if (!session) redirect('/login')

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
            Name your workspace
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            This is where your team's boards will live.
          </p>
        </div>

        <OnboardingForm />
      </div>
    </div>
  )
}
