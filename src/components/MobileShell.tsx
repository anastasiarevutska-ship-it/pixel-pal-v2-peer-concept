import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PhoneFrame } from './ui/PhoneFrame'
import { DemoControls } from './DemoControls'

type PresentationContext = {
  icon: string
  eyebrow: string
  title: string
  description: string
  /**
   * Pathnames (exact match against `location.pathname`) where the full
   * context — description, divider, "live concept prototype" disclaimer —
   * still shows: the journey's intro screen(s), before its primary CTA
   * ("Get started" on Member, "Let's go"/"Skip" on Pal's P1 cards) actually
   * starts the demo. Every other path in the journey collapses to just
   * icon + eyebrow + title, so the phone stays the focus once she's in the
   * flow rather than the intro repeating itself on every screen. Purely
   * derived from the current route — no stored state — so navigating back
   * to "/" and re-entering the journey naturally shows the full panel
   * again, same as a first visit.
   */
  expandedPaths: string[]
}

/**
 * Wraps a mobile route in the device mockup — spec §8: PhoneFrame centered
 * on a Lavender 20 backdrop. Also mounts the §9 demo controls (hidden by
 * default, fixed bottom-right) for every /m/* and /pal/* route.
 *
 * `context` is optional, presentation-only copy laid over the desktop
 * canvas around the phone — static per journey (Member vs. Pal), never per
 * screen, and never inside the device itself. The phone stays the hero,
 * dead center; `context` only adds quiet corner metadata (top-left: back
 * nav + journey identity; bottom-left: icon, concept statement, and the
 * "live concept prototype" disclaimer), never a competing panel beside it.
 * Purely a client-presentation frame around the existing prototype — it
 * changes nothing about the product screens, their behavior, or the
 * centered single-column layout routes without `context` (e.g. `/home`)
 * already used.
 */
export function MobileShell({
  children,
  label,
  context,
}: {
  children: ReactNode
  label?: string
  context?: PresentationContext
}) {
  const location = useLocation()
  const expanded = !!context && context.expandedPaths.includes(location.pathname)

  if (!context) {
    return (
      <div className="flex min-h-screen flex-col items-center gap-4 bg-lavender-20 p-10">
        <Link to="/" className="text-label-bold text-navy-60 hover:text-navy">
          ← Launcher
        </Link>
        {label && <p className="text-label text-navy-60">{label}</p>}
        <PhoneFrame>{children}</PhoneFrame>
        <DemoControls />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-lavender-20 p-10">
      {/* Top-left — quiet back-nav + which journey this is, not a heading. */}
      <div className="absolute left-10 top-10 flex flex-col gap-1">
        <Link to="/" className="text-label-bold text-navy-60 hover:text-navy">
          ← Back to overview
        </Link>
        <p className="text-label text-navy-60">{context.eyebrow}</p>
      </div>

      {/* The phone stays the hero, dead center of the canvas. */}
      <PhoneFrame>{children}</PhoneFrame>

      {/* Bottom-left — static journey context: quiet presentation metadata,
          not a competing content panel. Hierarchy inside this block mirrors
          its distance from the phone: identity, then the one-line concept
          statement, then the disclaimer, each a step quieter. */}
      <div className="absolute bottom-10 left-10 max-w-[260px]">
        <span className="flex h-9 w-9 items-center justify-center rounded-field bg-navy p-2">
          <img src={context.icon} alt="" aria-hidden="true" className="h-4 w-4" />
        </span>
        <p className="mt-3 text-label-bold uppercase text-lavender">{context.eyebrow}</p>
        <h2 className="mt-1 text-h4">{context.title}</h2>
        {expanded && (
          <>
            <p className="mt-2 text-body-sm text-navy-60">{context.description}</p>
            <div className="mt-6 border-t border-navy-20 pt-3">
              <p className="text-label-bold uppercase text-navy-40">Live concept prototype</p>
              <p className="mt-1 text-label text-navy-40">
                Interactive — screens may vary depending on the path taken.
              </p>
            </div>
          </>
        )}
      </div>

      <DemoControls />
    </div>
  )
}
