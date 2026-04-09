'use server'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { acceptInvite } from '@/services/workspace.service'

type ActionState = { error: string } | null

export async function acceptInviteAction(token: string): Promise<ActionState> {
  const session = await getSession()
  if (!session) return { error: 'You must be logged in to accept an invite.' }

  try {
    const { workspace } = await acceptInvite(token, session.userId)
    redirect(`/workspace/${workspace.slug}`)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to accept invite.' }
  }
}
