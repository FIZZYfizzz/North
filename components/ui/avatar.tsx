import { cn } from '@/lib/utils'

interface AvatarProps {
  name: string
  src?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

// Deterministic color from name
function getHue(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const hue = getHue(name)

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover shrink-0', sizeClasses[size], className)}
      />
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full shrink-0 font-medium select-none',
        sizeClasses[size],
        className,
      )}
      style={{
        background: `hsl(${hue}, 65%, 88%)`,
        color: `hsl(${hue}, 50%, 35%)`,
      }}
      title={name}
    >
      {getInitials(name)}
    </span>
  )
}

// ─── Avatar group (stacked overlap) ──────────────────────────────────────────

interface AvatarGroupProps {
  users: Array<{ name: string; avatarUrl?: string | null }>
  max?: number
  size?: AvatarProps['size']
}

export function AvatarGroup({ users, max = 3, size = 'xs' }: AvatarGroupProps) {
  const visible = users.slice(0, max)
  const overflow = users.length - max

  return (
    <div className="flex items-center">
      {visible.map((u, i) => (
        <span key={u.name + i} className="-ml-1 first:ml-0 ring-2 ring-[var(--bg-card)] rounded-full">
          <Avatar name={u.name} src={u.avatarUrl} size={size} />
        </span>
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            '-ml-1 inline-flex items-center justify-center rounded-full ring-2 ring-[var(--bg-card)]',
            'text-[10px] font-medium',
            sizeClasses[size],
          )}
          style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
        >
          +{overflow}
        </span>
      )}
    </div>
  )
}
