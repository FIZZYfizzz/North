'use client'

import { Button } from '@/components/ui/button'

interface EmptyBoardProps {
  onAddColumn: () => void
}

/**
 * Shown when a board has no columns yet.
 * Gives users a clear, friendly path to get started.
 */
export function EmptyBoard({ onAddColumn }: EmptyBoardProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-center px-8 py-16">
      {/* Illustration — abstract column shapes */}
      <div className="flex items-end gap-2 mb-8 opacity-30">
        {[40, 64, 48, 56].map((h, i) => (
          <div
            key={i}
            className="w-10 rounded-t-lg"
            style={{ height: h, background: 'var(--color-brand)' }}
          />
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        Your board is empty
      </h2>
      <p className="text-sm mb-8 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
        Add your first column to start organizing work. Drag and drop cards between columns as you go.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Button onClick={onAddColumn}>
          Add a column
        </Button>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          or press{' '}
          <kbd
            className="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-xs"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-medium)' }}
          >
            N
          </kbd>
        </p>
      </div>
    </div>
  )
}
