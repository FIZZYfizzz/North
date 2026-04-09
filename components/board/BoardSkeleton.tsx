import { Skeleton } from '@/components/ui/skeleton'

function CardSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div
      className="rounded-[var(--radius-card)] p-3.5"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
    >
      <Skeleton className={`h-3.5 mb-2 ${wide ? 'w-full' : 'w-4/5'}`} />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

function ColumnSkeleton({ cardCount, offset = 0 }: { cardCount: number; offset?: number }) {
  return (
    <div
      className="flex flex-col w-72 shrink-0 rounded-[var(--radius-panel)]"
      style={{ background: 'var(--bg-column)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-6 ml-1" />
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 p-2">
        {Array.from({ length: cardCount }).map((_, i) => (
          <CardSkeleton key={i} wide={(i + offset) % 3 === 0} />
        ))}
      </div>
    </div>
  )
}

export function BoardSkeleton() {
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-base)' }}>
      {/* Board header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-7 w-20" />
      </div>

      {/* Canvas */}
      <div className="flex items-start gap-4 p-6 overflow-x-hidden">
        <ColumnSkeleton cardCount={3} offset={0} />
        <ColumnSkeleton cardCount={2} offset={1} />
        <ColumnSkeleton cardCount={4} offset={2} />
        <ColumnSkeleton cardCount={1} offset={0} />
      </div>
    </div>
  )
}

// ─── Workspace page skeleton ──────────────────────────────────────────────────

function BoardCardSkeleton() {
  return (
    <div
      className="h-32 rounded-[var(--radius-card)]"
      style={{
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="p-5 flex flex-col justify-between h-full">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export function WorkspaceSkeleton() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>

      {/* Boards grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <BoardCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
