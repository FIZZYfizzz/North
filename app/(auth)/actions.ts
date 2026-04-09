'use server'

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword, setSession, clearSession } from '@/lib/auth'

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionState = { error: string } | null

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = (formData.get('name') as string | null)?.trim()
  const email = (formData.get('email') as string | null)?.trim().toLowerCase()
  const password = formData.get('password') as string | null

  if (!name || name.length < 2) return { error: 'Name must be at least 2 characters.' }
  if (!email || !email.includes('@')) return { error: 'A valid email is required.' }
  if (!password || password.length < 8) return { error: 'Password must be at least 8 characters.' }

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) return { error: 'An account with this email already exists.' }

  const passwordHash = await hashPassword(password)
  const user = await db.user.create({
    data: { name, email, passwordHash },
    select: { id: true, email: true },
  })

  await setSession({ userId: user.id, email: user.email })
  redirect('/onboarding')
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = (formData.get('email') as string | null)?.trim().toLowerCase()
  const password = formData.get('password') as string | null

  if (!email || !password) return { error: 'Email and password are required.' }

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true },
  })

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: 'Invalid email or password.' }
  }

  await setSession({ userId: user.id, email: user.email })
  redirect('/')
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  await clearSession()
  redirect('/login')
}
