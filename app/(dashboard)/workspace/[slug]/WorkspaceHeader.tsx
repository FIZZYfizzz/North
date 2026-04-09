'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShareModal } from '@/components/workspace/ShareModal'

interface WorkspaceHeaderProps {
  name: string
  description?: string
  workspaceId: string
}

export function WorkspaceHeader({ name, description, workspaceId }: WorkspaceHeaderProps) {
  const [showShare, setShowShare] = useState(false)

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {name}
          </h1>
          {description && (
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={() => setShowShare(true)}>
          Invite
        </Button>
      </div>

      {showShare && (
        <ShareModal workspaceId={workspaceId} onClose={() => setShowShare(false)} />
      )}
    </>
  )
}
