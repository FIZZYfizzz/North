'use client'

import { useEffect } from 'react'

interface Shortcut {
  /** The key to listen for (e.g. 'n', 'Escape', 'a') */
  key: string
  handler: () => void
  /**
   * When true (default), the shortcut is suppressed if the user
   * is focused inside an input, textarea, or contenteditable element.
   */
  ignoreWhenTyping?: boolean
  meta?: boolean
  shift?: boolean
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.getAttribute('contenteditable') === 'true') return true
  return false
}

/**
 * useKeyboardShortcuts — declarative keyboard shortcut registration.
 *
 * Re-registers handlers whenever the `shortcuts` array identity changes,
 * so wrap handlers in useCallback to avoid unnecessary re-registrations.
 *
 * @example
 *   useKeyboardShortcuts([
 *     { key: 'n', handler: () => setIsAddingColumn(true) },
 *     { key: 'a', handler: () => setShowActivity(v => !v) },
 *   ])
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        if (event.key !== shortcut.key) continue
        if (shortcut.meta !== undefined && event.metaKey !== shortcut.meta) continue
        if (shortcut.shift !== undefined && event.shiftKey !== shortcut.shift) continue
        if ((shortcut.ignoreWhenTyping ?? true) && isTyping(event.target)) continue

        event.preventDefault()
        shortcut.handler()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  // Re-run only when the shortcuts array reference changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcuts])
}
