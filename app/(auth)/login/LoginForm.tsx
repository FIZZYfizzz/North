'use client'

import { useActionState } from 'react'
import { loginAction } from '../actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, null)

  return (
    <form action={action} className="flex flex-col gap-4">
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
        placeholder="••••••••"
        autoComplete="current-password"
        required
        error={state?.error}
      />

      <Button type="submit" isLoading={isPending} className="mt-1 w-full justify-center">
        Sign in
      </Button>
    </form>
  )
}
