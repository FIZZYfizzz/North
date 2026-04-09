'use client'

import { Avatar } from '@/components/ui/avatar'

interface PresenceUser {
  userId: string
  name: string
  avatarUrl: string | null
}

interface PresenceAvatarsProps {
  users: PresenceUser[]
  currentUserId: string
  max?: number
}

/**
 * Shows who else is currently viewing the board.
 * Excludes the current user (they know they're here).
 * Shows a subtle online indicator dot on each avatar.
 */
export function PresenceAvatars({ users, currentUserId, max = 5 }: PresenceAvatarsProps) {
  const others = users.filter((u) => u.userId !== currentUserId)
  if (others.length === 0) return null

  const visible = others.slice(0, max)
  const overflow = others.length - max

  return (
    <div className="flex items-center gap-2">
      {/* Online indicator */}
      <span className="flex items-center gap-1.5">
        <span
          className="h-1.5 w-1.5 rounded-full animate-pulse"
          style={{ background: '#4ade80' }}
        />
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {others.length === 1 ? '1 other here' : `${others.length} others here`}
        </span>
      </span>

      {/* Avatars */}
      <div className="flex items-center">
        {visible.map((user, i) => (
          <span
            key={user.userId}
            className="relative -ml-1.5 first:ml-0"
            title={user.name}
          >
            {/* Online dot */}
            <span
              className="absolute bottom-0 right-0 h-2 w-2 rounded-full ring-2 ring-[var(--bg-base)] z-10"
              style={{ background: '#4ade80' }}
            />
            <Avatar
              name={user.name}
              src={user.avatarUrl}
              size="sm"
              className="ring-2 ring-[var(--bg-base)]"
            />
          </span>
        ))}

        {overflow > 0 && (
          <span
            className="-ml-1.5 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium ring-2 ring-[var(--bg-base)]"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
          >
            +{overflow}
          </span>
        )}
      </div>
    </div>
  )
}
