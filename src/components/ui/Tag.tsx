import type { HTMLAttributes } from 'react'

// Treatment labels (spec §4). Field radius groups it with chips/inputs.
export function Tag({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex items-center rounded-field bg-lavender-20 px-3 py-1 text-label-bold text-navy-80 ${className}`}
      {...props}
    />
  )
}
