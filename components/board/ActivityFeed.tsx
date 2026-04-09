'use client'

/**
 * ActivityFeed — board-level activity side panel.
 * Fetches recent activity for the board and displays a chronological list.
 * Toggles open/closed from the board header.
 */

import { useEffect, useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { Avatar } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { DialogClose } from '@/components/ui/dialog'
import type { ActivityType, UserPublic } from '@/types'

interface ActivityItem {
  id: string
  type: ActivityType
  createdAt: string
  payload: Record<string, unknown> | null
  user: UserPublic | null
}

const activityLabel: Partial<Record<ActivityType, string>> = {
  BOARD_CREATED: 'created the board',
  BOARD_UPDATED: 'updated the board',
  COLUMN_CREATED: 'added a column',
  COLUMN_RENAMED: 'renamed a column',
  COLUMN_MOVED: 'reordered columns',
  COLUMN_DELETED: 'deleted a column',
  CARD_CREATED: 'created a card',
  CARD_MOVED: 'moved a card',
  CARD_UPDATED: 'updated a card',
  CARD_PRIORITY_CHANGED: 'changed card priority',
  CARD_ASSIGNED: 'assigned someone to a card',
  CARD_UNASSIGNED: 'removed an assignee',
  CARD_ARCHIVED: 'archived a card',
  MEMBER_JOINED: 'joined the workspace',
  MEMBER_LEFT: 'left the workspace',
}

interface ActivityFeedProps {
  boardId: string
  onClose: () => void
}

export function ActivityFeed({ boardId, onClose }: ActivityFeedProps) {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/boards/${boardId}/activity`)
      .then((r) => r.json())
      .then((res) => setItems(res.data ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [boardId])

  return (
    <aside
      className="flex flex-col h-full border-l w-72 shrink-0"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Activity
        </h3>
        <DialogClose onClose={onClose} />
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner size="sm" />
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
            No activity yet.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-2.5">
              {item.user ? (
                <Avatar name={item.user.name} src={item.user.avatarUrl} size="xs" className="mt-0.5 shrink-0" />
              ) : (
                <span className="h-5 w-5 rounded-full shrink-0 bg-[var(--bg-subtle)]" />
              )}

              <div className="min-w-0">
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {item.user?.name ?? 'System'}
                  </span>
                  {' '}
                  {activityLabel[item.type] ?? item.type.toLowerCase().replace(/_/g, ' ')}
                </p>
                <p
                  className="text-[11px] mt-0.5"
                  style={{ color: 'var(--text-tertiary)' }}
                  title={format(new Date(item.createdAt), 'PPpp')}
                >
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
