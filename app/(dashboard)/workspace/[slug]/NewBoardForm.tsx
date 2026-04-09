'use client'

import { useActionState, useState } from 'react'
import { createBoardAction } from './actions'
import { Dialog, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Template = 'blank' | 'dev-sprint' | 'simple' | 'marketing'

const TEMPLATES: { id: Template; label: string; description: string; columns: string[] }[] = [
  { id: 'blank',      label: 'Blank',       description: 'Start from scratch.',                    columns: [] },
  { id: 'dev-sprint', label: 'Dev Sprint',  description: 'Backlog → In Progress → Review → Done.', columns: ['Backlog', 'In Progress', 'Review', 'Done'] },
  { id: 'simple',     label: 'Simple',      description: 'To Do → In Progress → Done.',             columns: ['To Do', 'In Progress', 'Done'] },
  { id: 'marketing',  label: 'Marketing',   description: 'Ideas → Drafts → In Review → Published.', columns: ['Ideas', 'Drafts', 'In Review', 'Published'] },
]

interface Props {
  workspaceId: string
}

export function NewBoardForm({ workspaceId }: Props) {
  const [open, setOpen] = useState(false)
  const [template, setTemplate] = useState<Template>('blank')
  const [state, action, isPending] = useActionState(createBoardAction, null)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center rounded-[var(--radius-card)] h-32 border-2 border-dashed text-sm font-medium transition-colors duration-150"
        style={{ borderColor: 'var(--border-medium)', color: 'var(--text-tertiary)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-brand)'
          e.currentTarget.style.color = 'var(--color-brand)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-medium)'
          e.currentTarget.style.color = 'var(--text-tertiary)'
        }}
      >
        + New board
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} size="md">
        <form action={action} className="flex flex-col gap-5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              New board
            </h2>
            <DialogClose onClose={() => setOpen(false)} />
          </div>

          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input type="hidden" name="template" value={template} />

          <Input
            label="Board name"
            name="name"
            placeholder="Q2 Roadmap"
            autoFocus
            required
            error={state?.error}
          />

          {/* Template picker */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Start from a template
            </p>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={cn(
                    'flex flex-col items-start rounded-xl p-3 text-left border transition-all duration-100',
                    template === t.id
                      ? 'ring-2 ring-[var(--color-brand)] border-transparent'
                      : 'hover:border-[var(--border-medium)]',
                  )}
                  style={{
                    background: 'var(--bg-subtle)',
                    borderColor: template === t.id ? 'transparent' : 'var(--border-subtle)',
                  }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {t.label}
                  </span>
                  <span className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {t.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Create board
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
