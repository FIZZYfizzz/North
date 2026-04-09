'use client'

import { useState } from 'react'
import { acceptInviteAction } from './actions'
import { Button } from '@/components/ui/button'

export function AcceptInviteButton({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleAccept() {
    setIsPending(true)
    setError(null)
    const result = await acceptInviteAction(token)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
    // On success, server action redirects — no need to handle here
  }

  return (
    <div className="flex flex-col gap-3">
      <Button isLoading={isPending} className="w-full justify-center" onClick={handleAccept}>
        Accept invitation
      </Button>
      {error && <p className="text-xs text-center text-red-500">{error}</p>}
    </div>
  )
}
