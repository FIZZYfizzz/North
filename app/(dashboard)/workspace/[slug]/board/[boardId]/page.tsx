import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getBoardDetail } from '@/services/board.service'
import { BoardView } from '@/components/board/BoardView'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string; boardId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { boardId } = await params
  const session = await getSession()
  if (!session) return {}
  const board = await getBoardDetail(boardId, session.userId)
  return { title: board?.name ?? 'Board' }
}

export default async function BoardPage({ params }: Props) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { boardId } = await params
  const board = await getBoardDetail(boardId, session.userId)
  if (!board) notFound()

  return <BoardView initialBoard={board} workspaceId={board.workspaceId} currentUserId={session.userId} />
}
