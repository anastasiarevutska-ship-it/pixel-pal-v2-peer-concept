import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

/**
 * Empty states are invitations, not apologies (spec §10) — never a bare
 * "nothing here" with only a cancel button (spec §11.7). Lavender 20, not
 * a stark white/gray void.
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card bg-lavender-20 p-6 text-center">
      <p className="text-h4">{title}</p>
      {description && <p className="text-body-sm text-navy-60">{description}</p>}
      {action}
    </div>
  )
}
