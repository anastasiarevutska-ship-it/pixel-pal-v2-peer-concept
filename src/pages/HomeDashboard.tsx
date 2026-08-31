import { MobileShell } from '../components/MobileShell'
import { PatientDashboard } from './PatientDashboard'
import { PixelPalReminderCard } from '../components/PixelPalReminderCard'
import { samantha, dashboards } from '../lib/seed'

/**
 * `/home` — Samantha's copy of the shared `PatientDashboard` (see that file
 * for the screen itself and the Figma source). Not part of Pixel Pal's
 * M1–M9; built as reference/context, and the one place her optional
 * `PixelPalReminderCard` lives (§6.1). Not nested under a layout route, so
 * `MobileShell` is applied here rather than inside `PatientDashboard`.
 */
export default function HomeDashboard() {
  return (
    <MobileShell label="Home — app dashboard, not part of Pixel Pal M1–M9">
      <PatientDashboard
        person={samantha}
        content={dashboards[samantha.id]}
        reminder={<PixelPalReminderCard />}
      />
    </MobileShell>
  )
}
