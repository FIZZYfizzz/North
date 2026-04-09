import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { AcceptInviteButton } from './AcceptInviteButton'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import type { Metadata } from 'next'

interface Props { params: Promise<{ token: string }> }

export const metadata: Metadata = { title: 'You have an invitation' }

export default async function InvitePage({ params }: Props) {
  const { token } = await params

  const invite = await db.invite.findUnique({
    where: { token },
    include: {
      workspace: { select: { name: true, slug: true } },
      invitedBy: { select: { name: true } },
    },
  })

  // Determine state: invalid, expired, or already accepted
  if (!invite) {
    return <InviteShell><ErrorState message="This invite link is invalid or has already been used." /></InviteShell>
  }
  if (invite.acceptedAt) {
    return <InviteShell><ErrorState message="This invite has already been accepted." /></InviteShell>
  }
  if (invite.expiresAt < new Date()) {
    return <InviteShell><ErrorState message="This invite has expired. Ask the sender for a new link." /></InviteShell>
  }

  // Check current session
  const session = await getSession()

  // If already a workspace member, skip to the workspace
  if (session) {
    const existing = await db.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: invite.workspaceId, userId: session.userId } },
    })
    if (existing) redirect(`/workspace/${invite.workspace.slug}`)
  }

  return (
    <InviteShell>
      <div className="text-center mb-7">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {invite.invitedBy.name}
          </span>
          {' '}invited you to join
        </p>
        <h1 className="mt-2 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {invite.workspace.name}
        </h1>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Invite expires {format(invite.expiresAt, 'MMM d, yyyy')}
        </p>
      </div>

      {session ? (
        <AcceptInviteButton token={token} />
      ) : (
        <div className="flex flex-col gap-3">
          <a
            href={`/register`}
            className="flex h-10 items-center justify-center rounded-xl text-sm font-medium text-white transition-colors"
            style={{ background: 'var(--color-brand)' }}
          >
            Create account to join
          </a>
          <a
            href={`/login`}
            className="flex h-10 items-center justify-center rounded-xl text-sm font-medium border transition-colors"
            style={{ borderColor: 'var(--border-medium)', color: 'var(--text-secondary)' }}
          >
            Sign in with existing account
          </a>
          <p className="text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
            After signing in, return to this link to accept.
          </p>
        </div>
      )}
    </InviteShell>
  )
}

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="mb-8">
        <span className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          North
        </span>
      </div>
      <div
        className="w-full max-w-sm rounded-[var(--radius-dialog)] p-8"
        style={{
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-dialog)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="text-center">
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</p>
      <a
        href="/"
        className="mt-4 inline-block text-sm font-medium hover:underline"
        style={{ color: 'var(--color-brand)' }}
      >
        Go to North
      </a>
    </div>
  )
}
