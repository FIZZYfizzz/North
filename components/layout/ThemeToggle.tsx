'use client'

import { useState, useEffect, useRef } from 'react'

const THEMES = [
  { id: 'light',  label: 'Light',  bg: '#f9f9f8', accent: '#7c6af7' },
  { id: 'dark',   label: 'Dark',   bg: '#111110', accent: '#7c6af7' },
  { id: 'blue',   label: 'Blue',   bg: '#0f1117', accent: '#5b8dd9' },
  { id: 'violet', label: 'Violet', bg: '#111018', accent: '#9d87fa' },
  { id: 'sage',   label: 'Sage',   bg: '#0f1210', accent: '#5a9e78' },
  { id: 'sand',   label: 'Sand',   bg: '#f6f3ee', accent: '#8a6840' },
  { id: 'mocha',  label: 'Mocha',  bg: '#0d0c0b', accent: '#a67c6a' },
] as const

type ThemeId = typeof THEMES[number]['id']

function applyTheme(id: ThemeId) {
  if (id === 'light') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', id)
  }
  localStorage.setItem('north_theme', id)
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeId>('light')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('north_theme') as ThemeId | null
    const id = saved ?? 'light'
    setTheme(id)
    applyTheme(id)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectTheme(id: ThemeId) {
    setTheme(id)
    applyTheme(id)
    setOpen(false)
  }

  const current = THEMES.find((t) => t.id === theme)!

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger — two-tone swatch of current theme */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Change theme"
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
        style={{ color: 'var(--text-tertiary)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        <span
          className="h-4 w-4 rounded-full relative overflow-hidden"
          style={{ background: current.bg, boxShadow: '0 0 0 1.5px rgba(128,128,128,0.25)' }}
        >
          <span
            className="absolute bottom-0 right-0 h-2 w-2 rounded-tl-full"
            style={{ background: current.accent }}
          />
        </span>
      </button>

      {/* Picker popover */}
      {open && (
        <div
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-xl p-3 z-50"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-dialog)',
            width: '176px',
          }}
        >
          <p className="text-xs font-medium mb-2.5 px-0.5" style={{ color: 'var(--text-tertiary)' }}>
            Theme
          </p>

          <div className="grid grid-cols-2 gap-1.5">
            {THEMES.map((t) => {
              const isActive = t.id === theme
              return (
                <button
                  key={t.id}
                  onClick={() => selectTheme(t.id)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors text-xs"
                  style={{
                    background: isActive ? 'var(--bg-subtle)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 500 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--bg-subtle)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {/* Swatch */}
                  <span
                    className="h-4 w-4 rounded-full shrink-0 relative overflow-hidden"
                    style={{
                      background: t.bg,
                      boxShadow: isActive
                        ? `0 0 0 2px var(--bg-elevated), 0 0 0 3px ${t.accent}`
                        : '0 0 0 1.5px rgba(128,128,128,0.25)',
                    }}
                  >
                    <span
                      className="absolute bottom-0 right-0 h-2 w-2 rounded-tl-full"
                      style={{ background: t.accent }}
                    />
                  </span>
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
