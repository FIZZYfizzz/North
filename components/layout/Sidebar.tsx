'use client'

/**
 * Sidebar — workspace navigation.
 * Renders board links and handles logout.
 * Receives data as props (fetched server-side in layout).
 */

import { useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { ThemeToggle } from './ThemeToggle'
import { logoutAction } from '@/app/(auth)/actions'
import { createWorkspaceAction } from '@/app/onboarding/actions'
import type { BoardSummary, UserPublic } from '@/types'

interface SidebarProps {
  workspace: { name: string; slug: string }
  boards: BoardSummary[]
  user: UserPublic
  allWorkspaces: { name: string; slug: string }[]
}

export function Sidebar({ workspace, boards, user, allWorkspaces }: SidebarProps) {
  const pathname = usePathname()
  const [showSwitcher, setShowSwitcher] = useState(false)
  const [showNewWorkspace, setShowNewWorkspace] = useState(false)
  const newWorkspaceInputRef = useRef<HTMLInputElement>(null)
  const otherWorkspaces = allWorkspaces.filter((ws) => ws.slug !== workspace.slug)

  return (
    <aside
      className="flex flex-col h-full w-60 shrink-0 border-r"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      {/* Workspace header */}
      <div className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2.5 px-4 py-4">
          <Link
            href={`/workspace/${workspace.slug}`}
            className="flex items-center gap-2.5 flex-1 min-w-0"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white shrink-0"
              style={{ background: 'var(--color-brand)' }}
            >
              {workspace.name[0]?.toUpperCase()}
            </span>
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {workspace.name}
            </span>
          </Link>

          {/* Workspace switcher toggle — only shown when user has multiple workspaces */}
          {otherWorkspaces.length > 0 && (
            <button
              onClick={() => setShowSwitcher((v) => !v)}
              title="Switch workspace"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 15 15"
                fill="none"
                style={{ transform: showSwitcher ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}
              >
                <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
              </svg>
            </button>
          )}
        </div>

        {/* Workspace switcher dropdown */}
        {showSwitcher && otherWorkspaces.length > 0 && (
          <div className="px-2 pb-2">
            {otherWorkspaces.map((ws) => (
              <Link
                key={ws.slug}
                href={`/workspace/${ws.slug}`}
                onClick={() => setShowSwitcher(false)}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white shrink-0"
                  style={{ background: 'var(--text-tertiary)' }}
                >
                  {ws.name[0]?.toUpperCase()}
                </span>
                <span className="truncate">{ws.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Board list */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <p className="px-2 pb-1.5 text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
          Boards
        </p>

        {boards.map((board) => {
          const href = `/workspace/${workspace.slug}/board/${board.id}`
          const isActive = pathname === href

          return (
            <Link
              key={board.id}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors duration-100',
              )}
              style={{
                color: isActive ? 'var(--color-brand)' : 'var(--text-secondary)',
                background: isActive ? 'color-mix(in srgb, var(--color-brand) 10%, transparent)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--bg-subtle)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent'
              }}
            >
              {board.coverColor ? (
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: board.coverColor }}
                />
              ) : (
                <span className="h-2 w-2 rounded-full shrink-0 bg-[var(--border-medium)]" />
              )}
              <span className="truncate">{board.name}</span>
            </Link>
          )
        })}

        {boards.length === 0 && (
          <p className="px-2 py-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            No boards yet.
          </p>
        )}

        {/* New workspace */}
        <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          {showNewWorkspace ? (
            <form
              action={async (fd) => {
                await createWorkspaceAction(null, fd)
              }}
              className="px-2"
            >
              <input
                ref={newWorkspaceInputRef}
                name="name"
                autoFocus
                placeholder="Workspace name"
                className="w-full rounded-lg px-2 py-1.5 text-sm outline-none"
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowNewWorkspace(false)
                }}
              />
              <div className="flex gap-1.5 mt-1.5">
                <button
                  type="submit"
                  className="flex-1 rounded-lg py-1 text-xs font-medium text-white"
                  style={{ background: 'var(--color-brand)' }}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewWorkspace(false)}
                  className="flex-1 rounded-lg py-1 text-xs font-medium"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowNewWorkspace(true)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-subtle)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent' }}
            >
              <svg width="12" height="12" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1a.5.5 0 0 1 .5.5V7h5.5a.5.5 0 0 1 0 1H8v5.5a.5.5 0 0 1-1 0V8H1.5a.5.5 0 0 1 0-1H7V1.5a.5.5 0 0 1 .5-.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
              </svg>
              New workspace
            </button>
          )}
        </div>
      </nav>

      {/* Bottom: user + theme toggle */}
      <div className="flex items-center justify-between gap-2 px-3 py-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={user.name} src={user.avatarUrl} size="sm" />
          <span className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
            {user.name}
          </span>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <ThemeToggle />
          <form action={logoutAction}>
            <button
              type="submit"
              title="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-100"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                <path d="M3 1a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h7a.5.5 0 0 0 0-1H3V2h7a.5.5 0 0 0 0-1H3Zm9.854 3.646a.5.5 0 0 0-.707.707L13.293 7H6.5a.5.5 0 0 0 0 1h6.793l-1.147 1.146a.5.5 0 0 0 .708.708l2-2a.5.5 0 0 0 0-.708l-2-2Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
