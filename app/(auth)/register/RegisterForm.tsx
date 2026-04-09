'use client'

import { useActionState } from 'react'
import { registerAction } from '../actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function RegisterForm() {
  const [state, action, isPending] = useActionState(registerAction, null)

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input
        label="Your name"
        name="name"
        type="text"
        placeholder="Ada Lovelace"
        autoComplete="name"
        required
      />
      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="Min. 8 characters"
        autoComplete="new-password"
        required
        hint="Must be at least 8 characters."
        error={state?.error}
      />

      <Button type="submit" isLoading={isPending} className="mt-1 w-full justify-center">
        Create account
      </Button>
    </form>
  )
}
