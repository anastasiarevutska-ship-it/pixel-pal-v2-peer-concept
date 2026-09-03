import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  fullWidth?: boolean
}

// Pill radius on all variants: not explicitly named in spec §3's shape
// list (which only covers cards/inputs/pills/avatars), but consistent with
// the pill/avatar radius already in the system, and it's the token that
// exists — never an arbitrary one.
const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-6 text-body-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-navy text-white hover:bg-navy-80',
  secondary: 'bg-lavender-40 text-navy hover:bg-lavender-80',
  ghost: 'bg-transparent text-navy underline-offset-4 hover:underline',
  // Coral, sparingly, per spec §3 — calm/warm, not an alarm color.
  destructive: 'border border-coral bg-white text-coral hover:bg-coral/10',
  // Navy-outlined secondary action — for a real but non-alarming choice
  // (e.g. "Find someone else") that shouldn't read as destructive/coral.
  outline: 'border border-navy bg-white text-navy hover:bg-lavender-20',
}

export function Button({ variant = 'primary', fullWidth = true, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    />
  )
}
