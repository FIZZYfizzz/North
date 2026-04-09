import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  /** Rounded variant — defaults to 'lg' */
  rounded?: 'sm' | 'lg' | 'full'
}

const roundedMap = { sm: 'rounded-md', lg: 'rounded-lg', full: 'rounded-full' }

export function Skeleton({ className, rounded = 'lg' }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse', roundedMap[rounded], className)}
      style={{ background: 'var(--bg-subtle)' }}
    />
  )
}
