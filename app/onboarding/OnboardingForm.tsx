'use client'

import { useActionState } from 'react'
import { createWorkspaceAction } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function OnboardingForm() {
  const [state, action, isPending] = useActionState(createWorkspaceAction, null)

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input
        label="Workspace name"
        name="name"
        type="text"
        placeholder="Acme Corp"
        autoFocus
        required
        error={state?.error}
        hint="You can always change this later."
      />

      <Button type="submit" isLoading={isPending} className="mt-1 w-full justify-center">
        Create workspace
      </Button>
    </form>
  )
}
