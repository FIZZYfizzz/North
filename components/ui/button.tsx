import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'default' | 'ghost' | 'destructive' | 'outline'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
}

const variantClasses: Record<Variant, string> = {
  default: [
    'bg-[var(--color-brand)] text-white',
    'hover:bg-[var(--color-brand-hover)]',
    'active:scale-[0.98]',
  ].join(' '),
  ghost: [
    'bg-transparent text-[var(--text-secondary)]',
    'hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
  ].join(' '),
  outline: [
    'bg-transparent border border-[var(--border-medium)] text-[var(--text-primary)]',
    'hover:bg-[var(--bg-subtle)]',
  ].join(' '),
  destructive: [
    'bg-red-500 text-white',
    'hover:bg-red-600',
    'active:scale-[0.98]',
  ].join(' '),
}

const sizeClasses: Record<Size, string> = {
  sm:   'h-7  px-2.5 text-xs  rounded-lg  gap-1.5',
  md:   'h-9  px-3.5 text-sm  rounded-xl  gap-2',
  lg:   'h-11 px-5   text-sm  rounded-xl  gap-2',
  icon: 'h-8  w-8    text-sm  rounded-lg  justify-center',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center font-medium transition-all duration-[150ms]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
