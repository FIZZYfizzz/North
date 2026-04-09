'use server'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { createWorkspace } from '@/services/workspace.service'

type ActionState = { error: string } | null

export async function createWorkspaceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated.' }

  const name = (formData.get('name') as string | null)?.trim()
  if (!name || name.length < 2) return { error: 'Workspace name must be at least 2 characters.' }

  const workspace = await createWorkspace(session.userId, name)
  redirect(`/workspace/${workspace.slug}`)
}
