import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id: externalId, ...props }, ref) => {
    const generatedId = useId()
    const id = externalId ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {label}
          </label>
        )}

        <input
          id={id}
          ref={ref}
          className={cn(
            'h-10 w-full rounded-xl px-3 text-sm outline-none transition-all duration-150',
            'border placeholder:text-[var(--text-tertiary)]',
            'bg-[var(--bg-subtle)] text-[var(--text-primary)]',
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
              : 'border-[var(--border-subtle)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15',
            className,
          )}
          {...props}
        />

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{hint}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
