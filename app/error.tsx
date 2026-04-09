'use client'

/**
 * app/error.tsx — global error boundary.
 * Wraps the root layout, so must render its own <html>/<body>.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ background: '#f9f9f8', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</p>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a1a1a', margin: '0 0 0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b6b6b', marginBottom: '1.5rem' }}>
            An unexpected error occurred. We've been notified.
          </p>
          {error.digest && (
            <p style={{ fontSize: '0.75rem', color: '#9b9b9b', marginBottom: '1rem', fontFamily: 'monospace' }}>
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              background: '#7c6af7',
              color: '#fff',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.5rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
