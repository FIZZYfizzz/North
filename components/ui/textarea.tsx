import { cn } from '@/lib/utils'
import { type TextareaHTMLAttributes, forwardRef, useId } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id: externalId, ...props }, ref) => {
    const generatedId = useId()
    const id = externalId ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {label}
          </label>
        )}

        <textarea
          id={id}
          ref={ref}
          className={cn(
            'w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-150 resize-none',
            'border placeholder:text-[var(--text-tertiary)] leading-relaxed',
            'bg-[var(--bg-subtle)] text-[var(--text-primary)]',
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
              : 'border-[var(--border-subtle)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15',
            className,
          )}
          {...props}
        />

        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{hint}</p>}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
