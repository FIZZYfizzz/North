'use client'

import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full text-center px-8"
      style={{ background: 'var(--bg-base)' }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'var(--bg-subtle)' }}
      >
        <svg width="20" height="20" viewBox="0 0 15 15" fill="none">
          <path d="M7.5 1a6.5 6.5 0 1 0 0 13A6.5 6.5 0 0 0 7.5 1ZM7 4.5a.5.5 0 0 1 1 0v4a.5.5 0 0 1-1 0v-4Zm.5 6.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" style={{ color: 'var(--text-tertiary)' }}/>
        </svg>
      </div>

      <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        Something went wrong
      </h2>
      <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>

      {error.digest && (
        <p className="text-xs font-mono mb-4" style={{ color: 'var(--text-tertiary)' }}>
          {error.digest}
        </p>
      )}

      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="ghost" onClick={() => window.location.href = '/'}>
          Go home
        </Button>
      </div>
    </div>
  )
}
