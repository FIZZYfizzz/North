import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── Class name utility ───────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Position utilities (float-based reordering) ──────────────────────────────

/**
 * Returns a position value that sits between `before` and `after`.
 * Pass null for either end to place at start or end of list.
 *
 * @example
 *   getBetweenPosition(null, 1000)   → 0    (before first)
 *   getBetweenPosition(1000, 2000)   → 1500 (between)
 *   getBetweenPosition(2000, null)   → 3000 (after last)
 */
export function getBetweenPosition(before: number | null, after: number | null): number {
  if (before === null && after === null) return 1000
  if (before === null) return (after! - 1000 < 0 ? 0 : after! - 1000)
  if (after === null) return before + 1000
  return (before + after) / 2
}

/**
 * Checks if positions need renormalization (gap too small for further splitting).
 * Threshold: gap < 1 between any two adjacent items.
 */
export function needsRenormalization(positions: number[]): boolean {
  const sorted = [...positions].sort((a, b) => a - b)
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i]! - sorted[i - 1]! < 1) return true
  }
  return false
}

/**
 * Returns evenly spaced positions (1000 apart) for a list of items.
 * Use when renormalization is needed.
 */
export function normalizePositions(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i + 1) * 1000)
}

// ─── API response helpers ─────────────────────────────────────────────────────

export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ data }, { status })
}

export function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

// ─── Type guards ──────────────────────────────────────────────────────────────

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0
}

// ─── Slug generation ──────────────────────────────────────────────────────────

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
