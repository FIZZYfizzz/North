import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: 'var(--bg-base)' }}
    >
      <p className="text-6xl font-bold tracking-tighter mb-4" style={{ color: 'var(--border-medium)' }}>
        404
      </p>
      <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        Page not found
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="text-sm font-medium hover:underline"
        style={{ color: 'var(--color-brand)' }}
      >
        Back to North
      </Link>
    </div>
  )
}
