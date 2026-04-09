'use server'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { createBoard, type BoardTemplate } from '@/services/board.service'
import { db } from '@/lib/db'

type ActionState = { error: string } | null

export async function createBoardAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated.' }

  const name = (formData.get('name') as string | null)?.trim()
  const workspaceId = formData.get('workspaceId') as string | null
  const template = (formData.get('template') as BoardTemplate | null) ?? 'blank'

  if (!name || name.length < 1) return { error: 'Board name is required.' }
  if (!workspaceId) return { error: 'Workspace not found.' }

  const board = await createBoard(workspaceId, session.userId, { name, template })

  // Find workspace slug for redirect
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: { slug: true },
  })

  redirect(`/workspace/${workspace!.slug}/board/${board.id}`)
}
