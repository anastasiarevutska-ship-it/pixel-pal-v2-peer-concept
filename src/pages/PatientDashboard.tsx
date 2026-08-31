import type { ReactNode } from 'react'
import { TabBar } from '../components/TabBar'
import { Avatar } from '../components/ui/Avatar'
import { Card } from '../components/ui/Card'
import type { DashboardContent, Person } from '../lib/types'
import bgGlow from '../assets/home/bg-glow.png'
import iconChart from '../assets/home/icon-chart.svg'
import iconTruck from '../assets/home/icon-truck.svg'
import iconChevronDown from '../assets/home/icon-chevron-down.svg'
import iconBellBody from '../assets/home/icon-bell-body.svg'
import iconBellDot from '../assets/home/icon-bell-dot.svg'

function IconBox({ icon }: { icon: string }) {
  return (
    <div className="flex shrink-0 items-center justify-center rounded-icon bg-lavender-40 p-2">
      <img src={icon} alt="" aria-hidden="true" className="h-6 w-6" />
    </div>
  )
}

/**
 * Real Home screen — Figma file `yuv1vQ8GyJLitbNh3Qawhl`, node 16785:20785
 * ("⭐️ NEW Patient App"). Presentational: takes whichever person's content
 * this is (`person`, `content`) and a `reminder` slot for whatever card sits
 * last in the feed. Extracted out of the original `HomeDashboard` so both
 * Samantha (Requester, `/home`) and Jordan (Pal, `/pal/dashboard`) render
 * through one screen instead of two copies — see `HomeDashboard.tsx` and
 * `pal/PalDashboard.tsx` for the two thin call sites and their seed data
 * (`dashboards` in `seed.ts`).
 *
 * Deviations from the literal pull (unchanged from the original):
 * - Profile photo replaced with the initials `Avatar` — spec §6: "no stock
 *   photos of real people."
 * - Status bar/home indicator come from `PhoneFrame`, not Figma's own
 *   exported status-bar assets.
 *
 * Does *not* include `MobileShell` itself — callers differ on that. `/home`
 * isn't nested under a layout route, so `HomeDashboard` wraps it directly;
 * `/pal/dashboard` is nested under `PalLayout`, which already provides
 * `MobileShell`, so `PalDashboard` renders this bare (nesting it twice would
 * double the phone frame and the demo-controls panel).
 */
export function PatientDashboard({
  person,
  content,
  reminder,
  reminderFirst = false,
}: {
  person: Person
  content: DashboardContent
  reminder: ReactNode
  /** The member's reminder is an optional discovery nudge, so it renders
   * last — never outranking real clinical content (§6.1). The Pal's is a
   * real obligation to someone already waiting, so it renders first
   * instead; see `PalDashboard`. */
  reminderFirst?: boolean
}) {
  return (
    <>
      <div className="relative flex min-h-full flex-col">
        <img
          src={bgGlow}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] w-full object-cover"
        />

        <div className="relative flex flex-col gap-8 p-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={person.displayName} size="lg" />
              <div>
                <p className="text-body text-navy-80">How can we help,</p>
                <p className="text-body-bold text-navy-80">{person.displayName}?</p>
              </div>
            </div>
            <div className="relative h-5 w-5 shrink-0">
              <img src={iconBellBody} alt="Notifications" className="h-full w-full" />
              <img
                src={iconBellDot}
                alt=""
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5"
              />
            </div>
          </div>

          {/* Intro copy */}
          <div className="flex flex-col gap-4 text-center">
            <div className="flex flex-col gap-2">
              <p className="text-display">{content.dayLabel}</p>
              <p className="text-h4">{content.treatmentLabel}</p>
            </div>
            <p className="text-h4 text-navy-60">{content.encouragement}</p>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-4">
            {reminderFirst && reminder}

            <Card variant="glass" className="flex flex-col gap-6 p-3">
              <p className="text-card-title text-navy">Next Dose @ {content.nextDose.time}</p>
              <div className="flex w-full items-center gap-4">
                <div className="flex-1 text-navy-80">
                  <p className="text-body-bold">{content.nextDose.medication}</p>
                  <p className="text-body">{content.nextDose.detail}</p>
                </div>
                <button
                  type="button"
                  aria-label="Medication details"
                  className="flex shrink-0 items-center justify-center rounded-icon bg-navy p-2"
                >
                  <img src={iconChevronDown} alt="" aria-hidden="true" className="h-2 w-3.5" />
                </button>
              </div>
            </Card>

            <div className="flex flex-col gap-6 rounded-card bg-yellow-40 p-3">
              <div className="flex items-center gap-4">
                <IconBox icon={iconChart} />
                <p className="flex-1 text-card-title text-navy">Lab Test</p>
              </div>
              <div className="flex flex-col gap-1.5 text-navy-80">
                <p className="text-body-bold">{content.labTest.dateTime}</p>
                <p className="text-body">{content.labTest.location}</p>
              </div>
            </div>

            <Card variant="glass" className="flex flex-col gap-6 p-3">
              <div className="flex items-center gap-4">
                <IconBox icon={iconTruck} />
                <p className="flex-1 text-card-title text-navy">Delivery</p>
              </div>
              <div className="flex flex-col gap-1.5 text-navy-80">
                <p className="text-body-bold">{content.delivery.dateTime}</p>
                <p className="text-body">{content.delivery.detail}</p>
              </div>
            </Card>

            {/* Caller-supplied because the two sides show different cards
                here (§6.1 vs the Pal request reminder) with different
                visibility rules and, per `reminderFirst` above, different
                priority relative to the clinical cards. */}
            {!reminderFirst && reminder}
          </div>
        </div>

        <div className="relative mt-auto">
          <TabBar />
        </div>
      </div>
    </>
  )
}
