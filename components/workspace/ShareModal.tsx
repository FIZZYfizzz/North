'use client'

/**
 * ShareModal — invite team members to the workspace.
 * Creates an invite via API and shows the shareable link.
 */

import { useState } from 'react'
import { Dialog, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ShareModalProps {
  workspaceId: string
  onClose: () => void
}

type Role = 'MEMBER' | 'ADMIN'

export function ShareModal({ workspaceId, onClose }: ShareModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('MEMBER')
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleInvite() {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@')) {
      setError('Enter a valid email address.')
      return
    }

    setIsPending(true)
    setError(null)

    const res = await fetch(`/api/workspaces/${workspaceId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trimmed, role }),
    })

    const json = await res.json() as { data?: { inviteUrl: string }; error?: string }

    if (!res.ok || !json.data) {
      setError(json.error ?? 'Failed to create invite.')
    } else {
      setInviteUrl(json.data.inviteUrl)
    }

    setIsPending(false)
  }

  async function handleCopy() {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open onClose={onClose} size="sm">
      <div className="px-6 py-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Invite teammates
          </h2>
          <DialogClose onClose={onClose} />
        </div>

        {!inviteUrl ? (
          <>
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              onKeyDown={(e) => { if (e.key === 'Enter') handleInvite() }}
              error={error ?? undefined}
            />

            {/* Role selector */}
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Role</p>
              <div className="flex gap-2">
                {(['MEMBER', 'ADMIN'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="flex-1 rounded-xl py-2 text-sm font-medium transition-all duration-100 border"
                    style={{
                      borderColor: role === r ? 'var(--color-brand)' : 'var(--border-subtle)',
                      color: role === r ? 'var(--color-brand)' : 'var(--text-secondary)',
                      background: role === r
                        ? 'color-mix(in srgb, var(--color-brand) 8%, transparent)'
                        : 'var(--bg-subtle)',
                    }}
                  >
                    {r === 'MEMBER' ? 'Member' : 'Admin'}
                  </button>
                ))}
              </div>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {role === 'ADMIN' ? 'Can manage boards and invite others.' : 'Can view and edit boards.'}
              </p>
            </div>

            <Button isLoading={isPending} className="w-full justify-center" onClick={handleInvite}>
              Send invite
            </Button>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Share this link
              </p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                Send this link to your teammate. It expires in 7 days.
              </p>
              <div
                className="flex items-center gap-2 rounded-xl p-2.5 pr-1.5 border"
                style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
              >
                <p className="flex-1 text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                  {inviteUrl}
                </p>
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            <button
              onClick={() => { setInviteUrl(null); setEmail('') }}
              className="text-sm text-center hover:underline"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Invite another person
            </button>
          </div>
        )}
      </div>
    </Dialog>
  )
}
