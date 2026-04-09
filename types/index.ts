import type { Priority, WorkspaceRole, ActivityType } from '@prisma/client'

// Re-export Prisma enums so the rest of the app imports from one place
export type { Priority, WorkspaceRole, ActivityType }

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN TYPES  (shapes returned by services / API routes)
// ─────────────────────────────────────────────────────────────────────────────

export interface UserPublic {
  id: string
  email: string
  name: string
  avatarUrl: string | null
}

export interface WorkspaceWithRole {
  id: string
  name: string
  slug: string
  description: string | null
  role: WorkspaceRole
  createdAt: Date
}

export interface BoardSummary {
  id: string
  name: string
  description: string | null
  coverColor: string | null
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CardAssigneePublic {
  userId: string
  user: UserPublic
  assignedAt: Date
}

export interface CardDetail {
  id: string
  title: string
  description: string | null
  position: number
  priority: Priority
  dueDate: Date | null
  isArchived: boolean
  columnId: string
  assignees: CardAssigneePublic[]
  createdAt: Date
  updatedAt: Date
}

export interface ColumnWithCards {
  id: string
  name: string
  position: number
  color: string | null
  boardId: string
  cards: CardDetail[]
}

export interface BoardDetail {
  id: string
  name: string
  description: string | null
  coverColor: string | null
  workspaceId: string
  columns: ColumnWithCards[]
}

// ─────────────────────────────────────────────────────────────────────────────
// SOCKET.IO EVENT TYPES
// Typed events prevent mismatched event names between client and server.
// ─────────────────────────────────────────────────────────────────────────────

// Events the client sends TO the server
export interface ClientToServerEvents {
  'board:join': (boardId: string) => void
  'board:leave': (boardId: string) => void
  'card:move': (payload: CardMovePayload) => void
  'column:move': (payload: ColumnMovePayload) => void
}

// Events the server sends TO clients
export interface ServerToClientEvents {
  'card:moved': (payload: CardMovePayload) => void
  'card:created': (payload: CardDetail & { columnId: string }) => void
  'card:updated': (payload: Partial<CardDetail> & { id: string }) => void
  'card:deleted': (payload: { id: string; columnId: string }) => void
  'column:moved': (payload: ColumnMovePayload) => void
  'column:created': (payload: ColumnWithCards) => void
  'column:updated': (payload: { id: string; name?: string; color?: string }) => void
  'column:deleted': (payload: { id: string }) => void
  'presence:update': (payload: PresencePayload) => void
  'error': (message: string) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// SOCKET PAYLOADS
// ─────────────────────────────────────────────────────────────────────────────

export interface CardMovePayload {
  cardId: string
  fromColumnId: string
  toColumnId: string
  newPosition: number
}

export interface ColumnMovePayload {
  columnId: string
  newPosition: number
}

export interface PresencePayload {
  boardId: string
  users: Array<{ userId: string; name: string; avatarUrl: string | null }>
}

// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSE ENVELOPE
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  error: string
}
