/**
 * services/workspace.service.ts
 *
 * All business logic for workspaces, members, and invites.
 * API routes call these functions — they do not contain HTTP concerns.
 */

import { nanoid } from 'nanoid'
import { db } from '@/lib/db'
import { toSlug } from '@/lib/utils'
import type { WorkspaceRole } from '@/types'

// ─── Workspace CRUD ───────────────────────────────────────────────────────────

export async function createWorkspace(userId: string, name: string, description?: string) {
  const baseSlug = toSlug(name)

  // Ensure slug uniqueness
  const existing = await db.workspace.count({ where: { slug: { startsWith: baseSlug } } })
  const slug = existing === 0 ? baseSlug : `${baseSlug}-${nanoid(4)}`

  return db.workspace.create({
    data: {
      name,
      slug,
      description,
      members: {
        create: {
          userId,
          role: 'OWNER',
        },
      },
    },
    include: {
      members: { where: { userId }, select: { role: true } },
    },
  })
}

export async function getWorkspaceBySlug(slug: string, userId: string) {
  return db.workspace.findFirst({
    where: {
      slug,
      members: { some: { userId } },
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
      boards: {
        where: { isArchived: false },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          coverColor: true,
          isArchived: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  })
}

export async function getUserWorkspaces(userId: string) {
  return db.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          createdAt: true,
        },
      },
    },
    orderBy: { joinedAt: 'asc' },
  })
}

// ─── Invites ──────────────────────────────────────────────────────────────────

export async function createInvite(
  workspaceId: string,
  invitedById: string,
  email: string,
  role: WorkspaceRole = 'MEMBER',
) {
  // Check inviter has permission
  const inviter = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: invitedById } },
  })

  if (!inviter || inviter.role === 'MEMBER') {
    throw new Error('Only admins and owners can invite members')
  }

  // Revoke any existing pending invite for this email
  await db.invite.deleteMany({
    where: { workspaceId, email, acceptedAt: null },
  })

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days

  return db.invite.create({
    data: {
      workspaceId,
      invitedById,
      email,
      role,
      token: nanoid(32),
      expiresAt,
    },
    include: {
      workspace: { select: { name: true, slug: true } },
      invitedBy: { select: { name: true } },
    },
  })
}

export async function acceptInvite(token: string, userId: string) {
  const invite = await db.invite.findUnique({
    where: { token },
    include: { workspace: true },
  })

  if (!invite) throw new Error('Invite not found')
  if (invite.acceptedAt) throw new Error('Invite already used')
  if (invite.expiresAt < new Date()) throw new Error('Invite has expired')

  const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } })
  if (!user) throw new Error('User not found')
  if (user.email !== invite.email) throw new Error('This invite is for a different email address')

  // Add as member and mark invite accepted
  const [member] = await db.$transaction([
    db.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: invite.workspaceId, userId } },
      create: { workspaceId: invite.workspaceId, userId, role: invite.role },
      update: { role: invite.role },
    }),
    db.invite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    }),
  ])

  return { member, workspace: invite.workspace }
}
