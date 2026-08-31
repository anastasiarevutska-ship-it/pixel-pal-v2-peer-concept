import { Navigate } from 'react-router-dom'
import { useDemoStore } from '../../store/useDemoStore'

/**
 * `/pal` — the router, not a screen.
 *
 * Every entry point into the giving side lands here: the fork's "Become a
 * Pixel Pal" option (`/m/pixel-pal`) and the graduation pass-it-forward ask
 * (workshop §5 B1). Where it sends her depends only on where she already
 * is:
 *
 *   no profile   → P1, what this is
 *   has profile  → /pal/dashboard, her Home tab
 *
 * No admin review, so no in-between "pending" state to route through — a
 * `PalProfile` existing at all already means she's an active Pal (see the
 * store header note). `/pal/status` is a one-time landing spot right after
 * submitting, not a page she'd ever be routed back to. P8 (`/pal/home`,
 * requests/conversations/impact) now lives one level down from Home, behind
 * the "Pal Home" card on `/pal/messages` — see that screen.
 */
export default function PalEntry() {
  const palId = useDemoStore((s) => s.palFlow.palId)
  const profile = useDemoStore((s) => s.palProfiles[palId])

  if (!profile) return <Navigate to="/pal/about" replace />
  return <Navigate to="/pal/dashboard" replace />
}
