import { getSessionFromRequest, getCurrentUser } from '@/lib/auth'
import { createInvite } from '@/services/workspace.service'
import { sendInviteEmail } from '@/lib/email'
import { apiSuccess, apiError } from '@/lib/utils'
import type { WorkspaceRole } from '@/types'

interface Params { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const session = await getSessionFromRequest(request)
  if (!session) return apiError('Unauthorized', 401)

  const { id } = await params
  const body = await request.json() as { email?: string; role?: WorkspaceRole }

  if (!body.email?.trim()) return apiError('email is required')

  try {
    const [invite, inviter] = await Promise.all([
      createInvite(id, session.userId, body.email.trim().toLowerCase(), body.role),
      getCurrentUser(),
    ])

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`

    // Send email — non-blocking, failure doesn't break the invite
    if (process.env.RESEND_API_KEY) {
      sendInviteEmail({
        to: invite.email,
        invitedBy: inviter?.name ?? 'Someone',
        workspaceName: invite.workspace.name,
        inviteUrl,
      }).catch((err) => console.error('[invite] email send failed:', err))
    }

    return apiSuccess({ invite, inviteUrl }, 201)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create invite'
    return apiError(message, 403)
  }
}
