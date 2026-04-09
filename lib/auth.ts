import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import bcrypt from 'bcryptjs'
import { db } from './db'

const COOKIE_NAME = 'north_session'
const SALT_ROUNDS = 12

// ─── Token shape ─────────────────────────────────────────────────────────────

export interface SessionPayload extends JWTPayload {
  userId: string
  email: string
}

// ─── Password utilities ───────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ─── JWT utilities ────────────────────────────────────────────────────────────

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is not set')
  return new TextEncoder().encode(secret)
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? '7d')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as SessionPayload
}

// ─── Session cookie helpers (Server Components / Route Handlers) ──────────────

export async function setSession(payload: SessionPayload): Promise<void> {
  const { cookies } = await import('next/headers')
  const token = await signToken(payload)
  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearSession(): Promise<void> {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getSession(): Promise<SessionPayload | null> {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null

  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}

// ─── Current user helper ──────────────────────────────────────────────────────

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  return db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      createdAt: true,
    },
  })
}

// ─── API route session helper ─────────────────────────────────────────────────
// Used in route handlers that receive a Request object directly.

export async function getSessionFromRequest(request: Request): Promise<SessionPayload | null> {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  const token = match?.[1]

  if (!token) return null

  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}
