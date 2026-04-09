'use client'

/**
 * CardModal — full card detail view.
 *
 * - All fields auto-save on change (debounced 600ms).
 * - Assignees are fetched from workspace membership.
 * - Activity feed shows the card's history.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogClose } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { PrioritySelect } from './PrioritySelect'
import { cn } from '@/lib/utils'
import type { CardDetail, Priority, UserPublic, ActivityType } from '@/types'

interface CardModalProps {
  card: CardDetail
  boardId: string
  workspaceId: string
  onClose: () => void
  onCardUpdated: (update: Partial<CardDetail> & { id: string }) => void
}

interface ActivityItem {
  id: string
  type: ActivityType
  createdAt: string
  payload: Record<string, unknown> | null
  user: UserPublic | null
}

const activityLabel: Partial<Record<ActivityType, string>> = {
  CARD_CREATED: 'created this card',
  CARD_MOVED: 'moved this card',
  CARD_UPDATED: 'updated this card',
  CARD_PRIORITY_CHANGED: 'changed priority',
  CARD_ASSIGNED: 'assigned a member',
  CARD_UNASSIGNED: 'unassigned a member',
  CARD_ARCHIVED: 'archived this card',
}

export function CardModal({ card, boardId, workspaceId, onClose, onCardUpdated }: CardModalProps) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description ?? '')
  const [priority, setPriority] = useState<Priority>(card.priority)
  const [dueDate, setDueDate] = useState(
    card.dueDate ? format(new Date(card.dueDate), 'yyyy-MM-dd') : '',
  )
  const [isSaving, setIsSaving] = useState(false)
  const [members, setMembers] = useState<UserPublic[]>([])
  const [assigneeIds, setAssigneeIds] = useState<Set<string>>(
    new Set(card.assignees.map((a) => a.userId)),
  )
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch workspace members and card activity on mount
  useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}/members`)
      .then((r) => r.json())
      .then((res) => setMembers(res.data ?? []))
      .catch(() => {})

    fetch(`/api/cards/${card.id}/activity`)
      .then((r) => r.json())
      .then((res) => setActivity(res.data ?? []))
      .catch(() => {})
  }, [card.id, workspaceId])

  // Debounced save to API
  const save = useCallback(
    (patch: Partial<{ title: string; description: string; priority: Priority; dueDate: string | null }>) => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        setIsSaving(true)
        try {
          const body: Record<string, unknown> = { ...patch }
          if ('dueDate' in patch) {
            body.dueDate = patch.dueDate ? new Date(patch.dueDate).toISOString() : null
          }
          await fetch(`/api/cards/${card.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          // Propagate update to Zustand via the callback
          onCardUpdated({ id: card.id, ...patch })
        } finally {
          setIsSaving(false)
        }
      }, 600)
    },
    [card.id, onCardUpdated],
  )

  function handleTitleBlur() {
    setIsEditingTitle(false)
    if (title.trim() && title !== card.title) save({ title: title.trim() })
  }

  function handleDescriptionBlur() {
    if (description !== (card.description ?? '')) save({ description })
  }

  function handlePriorityChange(p: Priority) {
    setPriority(p)
    save({ priority: p })
  }

  function handleDueDateChange(value: string) {
    setDueDate(value)
    save({ dueDate: value || null })
  }

  async function toggleAssignee(userId: string) {
    const isAssigned = assigneeIds.has(userId)
    const next = new Set(assigneeIds)

    if (isAssigned) {
      next.delete(userId)
      setAssigneeIds(next)
      await fetch(`/api/cards/${card.id}/assignees`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
    } else {
      next.add(userId)
      setAssigneeIds(next)
      await fetch(`/api/cards/${card.id}/assignees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
    }
  }

  return (
    <Dialog open onClose={onClose} size="lg">
      <div className="flex flex-col">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-2">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') titleRef.current?.blur() }}
                className="w-full text-xl font-semibold bg-transparent outline-none border-b-2 border-[var(--color-brand)] pb-0.5"
                style={{ color: 'var(--text-primary)' }}
                autoFocus
              />
            ) : (
              <h2
                className="text-xl font-semibold cursor-text hover:text-[var(--color-brand)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onClick={() => setIsEditingTitle(true)}
                title="Click to edit"
              >
                {title}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isSaving && (
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Saving…</span>
            )}
            <DialogClose onClose={onClose} />
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="px-6 pb-6 flex flex-col gap-6 mt-2">

          {/* Priority */}
          <Section label="Priority">
            <PrioritySelect value={priority} onChange={handlePriorityChange} />
          </Section>

          {/* Due date */}
          <Section label="Due date">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => handleDueDateChange(e.target.value)}
              className={cn(
                'h-9 rounded-xl px-3 text-sm outline-none border transition-all duration-150',
                'bg-[var(--bg-subtle)] text-[var(--text-primary)]',
                'border-[var(--border-subtle)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15',
              )}
            />
            {dueDate && (
              <button
                onClick={() => handleDueDateChange('')}
                className="ml-2 text-xs hover:underline"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Clear
              </button>
            )}
          </Section>

          {/* Description */}
          <Section label="Description">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Add a description…"
              rows={4}
            />
          </Section>

          {/* Assignees */}
          {members.length > 0 && (
            <Section label="Assignees">
              <div className="flex flex-wrap gap-2">
                {members.map((member) => {
                  const isAssigned = assigneeIds.has(member.id)
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleAssignee(member.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all duration-100',
                        isAssigned
                          ? 'ring-2 ring-[var(--color-brand)] ring-offset-1 ring-offset-[var(--bg-elevated)]'
                          : 'opacity-60 hover:opacity-90',
                      )}
                      style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
                    >
                      <Avatar name={member.name} src={member.avatarUrl} size="xs" />
                      {member.name}
                    </button>
                  )
                })}
              </div>
            </Section>
          )}

          {/* Activity */}
          {activity.length > 0 && (
            <Section label="Activity">
              <div className="flex flex-col gap-3">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5">
                    {item.user && (
                      <Avatar name={item.user.name} src={item.user.avatarUrl} size="xs" className="mt-0.5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {item.user?.name ?? 'System'}
                        </span>
                        {' '}
                        {activityLabel[item.type] ?? item.type.toLowerCase().replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                        {format(new Date(item.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </Dialog>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </p>
      <div className="flex items-center flex-wrap gap-2">{children}</div>
    </div>
  )
}
