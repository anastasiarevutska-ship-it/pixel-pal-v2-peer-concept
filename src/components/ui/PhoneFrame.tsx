import type { ReactNode } from 'react'

/**
 * Realistic device frame — spec §8. 390×844 (iPhone-shape), status bar,
 * rounded corners, centered on a Lavender 20 backdrop by the page that
 * uses it (not baked in here, so this component stays reusable outside a
 * full-page context).
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="h-[844px] w-[390px] rounded-frame bg-navy p-3 shadow-card">
      {/* relative + overflow-hidden: Sheet/Modal/Toast use `absolute inset-0`
          so they confine to this device screen instead of escaping to the
          full browser viewport the way `fixed` would. */}
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-screen bg-gray20">
        <div className="flex items-center justify-between px-6 pb-1 pt-4 text-label-bold text-navy">
          <span>9:41</span>
          <span aria-hidden="true">●●●●</span>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
