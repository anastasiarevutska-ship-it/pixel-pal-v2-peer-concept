import type { HTMLAttributes } from 'react'

type CardVariant = 'standard' | 'glass'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant
}

const variants: Record<CardVariant, string> = {
  standard: 'bg-white shadow-card',
  // Glass card — the app's signature surface (spec §3). "Glass Morphism
  // Fill" is a diagonal gradient, not flat translucent white — corrected
  // to match the real Home screen (Figma). Needs contrast behind it to
  // read as glass; on a flat token-demo bg it's a subtler effect.
  glass: 'bg-glass-fill backdrop-blur-glass border border-white/60 shadow-glass',
}

export function Card({ variant = 'standard', className = '', ...props }: CardProps) {
  return <div className={`rounded-card p-4 ${variants[variant]} ${className}`} {...props} />
}
