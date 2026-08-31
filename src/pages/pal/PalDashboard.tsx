import { Navigate } from 'react-router-dom'
import { PatientDashboard } from '../PatientDashboard'
import { PalRequestReminderCard } from '../../components/PalRequestReminderCard'
import { useDemoStore } from '../../store/useDemoStore'
import { dashboards } from '../../lib/seed'

/**
 * `/pal/dashboard` — Jordan's Home tab, the Pal-side counterpart to `/home`.
 * Same shared `PatientDashboard` screen Samantha uses, with her own seeded
 * clinical content (`dashboards[jordan.id]` in `seed.ts` — placeholder
 * values, flagged there for review) instead of Samantha's, and
 * `PalRequestReminderCard` in place of the discovery-only
 * `PixelPalReminderCard`.
 *
 * Nested under `PalLayout`, which already supplies `MobileShell` — see
 * `PatientDashboard`'s docblock for why it doesn't wrap itself again here.
 */
export default function PalDashboard() {
  const palId = useDemoStore((s) => s.palFlow.palId)
  const person = useDemoStore((s) => s.people[palId])
  const profile = useDemoStore((s) => s.palProfiles[palId])

  if (!profile) return <Navigate to="/pal/about" replace />

  return (
    <PatientDashboard
      person={person}
      content={dashboards[palId]}
      reminder={<PalRequestReminderCard />}
      reminderFirst
    />
  )
}
