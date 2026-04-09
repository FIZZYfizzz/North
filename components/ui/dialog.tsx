'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  /** Width class — defaults to max-w-2xl */
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

export function Dialog({ open, onClose, children, className, size = 'lg' }: DialogProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  // Escape key to close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open || typeof window === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4"
      style={{ paddingTop: '8vh', paddingBottom: '8vh' }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 w-full rounded-[var(--radius-dialog)]',
          sizeMap[size],
          className,
        )}
        style={{
          background: 'var(--bg-elevated)',
          boxShadow: 'var(--shadow-dialog)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

// ─── Close button ─────────────────────────────────────────────────────────────

export function DialogClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-100"
      style={{ color: 'var(--text-tertiary)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      aria-label="Close"
    >
      <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
        <path d="M11.782 4.032a.575.575 0 1 0-.813-.813L7.5 6.687 4.031 3.22a.575.575 0 0 0-.813.813L6.687 7.5l-3.469 3.469a.575.575 0 0 0 .813.813L7.5 8.313l3.469 3.469a.575.575 0 0 0 .813-.813L8.313 7.5l3.469-3.468Z" fill="currentColor"/>
      </svg>
    </button>
  )
}
