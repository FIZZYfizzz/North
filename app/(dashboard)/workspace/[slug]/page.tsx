import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getWorkspaceBySlug } from '@/services/workspace.service'
import { NewBoardForm } from './NewBoardForm'
import { WorkspaceHeader } from './WorkspaceHeader'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: slug }
}

export default async function WorkspacePage({ params }: Props) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { slug } = await params
  const workspace = await getWorkspaceBySlug(slug, session.userId)
  if (!workspace) notFound()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <WorkspaceHeader
        name={workspace.name}
        description={workspace.description ?? undefined}
        workspaceId={workspace.id}
      />

      {/* Boards grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {workspace.boards.map((board) => (
          <Link
            key={board.id}
            href={`/workspace/${slug}/board/${board.id}`}
            className="group relative flex flex-col justify-between rounded-[var(--radius-card)] p-5 h-32 transition-all duration-200 hover:scale-[1.01]"
            style={{
              background: board.coverColor ?? 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {board.name}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {board.columns?.length ?? 0} columns
            </span>
          </Link>
        ))}

        {/* New board trigger */}
        <NewBoardForm workspaceId={workspace.id} />
      </div>
    </div>
  )
}
