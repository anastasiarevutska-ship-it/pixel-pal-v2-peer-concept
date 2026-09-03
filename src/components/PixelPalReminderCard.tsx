import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Button } from './ui/Button'
import { useDemoStore } from '../store/useDemoStore'

/** How often the reminder is allowed to appear, counted in Home visits. */
const VISIT_INTERVAL = 3

function  RiHeart3Fill() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className="text-navy"
    >
      <path
        d="M12 20s-7-4.35-9.5-8.5C.8 8 2 4.5 5.5 4a4.5 4.5 0 0 1 6.5 2 4.5 4.5 0 0 1 6.5-2c3.5.5 4.7 4 3 7.5C19 15.65 12 20 12 20Z"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Pixel Pal reminder — a feature reminder in the Home feed, sitting
 * alongside the real event cards (Next Dose, Lab Test, Delivery).
 *
 * It exists for the member who never scrolled to the Contacts screen and
 * so has never seen that Pixel Pal is available to her. It is deliberately
 * *not* an event card: no date, no time, nothing to do, and it never
 * outranks clinical content — it renders last in the feed and uses the
 * lavender brand tint rather than the glass/yellow treatments the real
 * events use, so it reads as "something available" rather than "something
 * scheduled."
 *
 * Four rules keep it from becoming nagging:
 * 1. It appears only every Nth Home visit, not every visit.
 * 2. "Not now" retires it permanently — dismissing is respected, not
 *    snoozed. The feature is still one tap away on Contacts.
 * 3. Reaching Contacts (M1) retires it too — she's seen the real invite
 *    there, so repeating it on Home would just be noise. See `ContactsEntry`.
 * 4. It never shows to a member who already has a Pal (pending, active, or
 *    quiet) — advertising a feature she's already using would be noise.
 *
 * Copy is an invitation, not a task (spec §10): no urgency, no badge, no
 * unread dot, and the dismissal is as prominent as the action.
 *
 * V2 addendum — once she's been through the "No match yet" branch
 * (`pixelPalSearchActive`, set by `PixelPalNoMatchYet`), this stops being a
 * discretionary feature reminder and becomes real status: it shows on every
 * visit, isn't dismissible, and ignores the cadence/`hasOngoing` rules above
 * (those are about the older Suggestions-based relationship flow, a
 * different, unrelated state). `matchAvailabilityDemo` — a presentation-only
 * demo control, not real async matching — decides whether it reads
 * "searching" or "ready". See docs/pixel-pal-v2-source-of-truth.md.
 */
export function PixelPalReminderCard() {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()

  const memberId = useDemoStore((s) => s.currentMemberId)
  const relationships = useDemoStore((s) => s.relationships)
  const currentRelationshipId = useDemoStore((s) => s.memberFlow.currentRelationshipId)
  const retired = useDemoStore((s) => s.pixelPalReminderRetired)
  const forced = useDemoStore((s) => s.pixelPalReminderForced)
  const registerHomeVisit = useDemoStore((s) => s.registerHomeVisit)
  const retirePixelPalReminder = useDemoStore((s) => s.retirePixelPalReminder)
  const startMemberFlow = useDemoStore((s) => s.startMemberFlow)
  const pixelPalSearchActive = useDemoStore((s) => s.pixelPalSearchActive)
  const matchAvailabilityDemo = useDemoStore((s) => s.matchAvailabilityDemo)

  // This visit's number, resolved once after the visit is counted.
  //
  // Two things matter here. The ref makes the count exact under StrictMode,
  // which double-invokes effects in dev — a reminder whose cadence silently
  // doubled would be indistinguishable from a bug. And holding the number in
  // local state (rather than reading the live counter every render) is what
  // stops the card from rendering against the *previous* visit's count and
  // then animating away — that flash of an appearing-then-vanishing card is
  // exactly the nagging feel this card is supposed to avoid.
  const [visitNo, setVisitNo] = useState<number | null>(null)
  const counted = useRef(false)
  useEffect(() => {
    if (counted.current) return
    counted.current = true
    registerHomeVisit()
    setVisitNo(useDemoStore.getState().homeVisitCount)
  }, [registerHomeVisit])

  const currentRel = currentRelationshipId ? relationships[currentRelationshipId] : undefined
  const hasOngoing = !!currentRel && ['pending', 'active', 'quiet'].includes(currentRel.state)

  // `forced` is the §9 demo control — it bypasses the cadence so the client
  // can see the card on demand, but not the "she already has a Pal" rule.
  const onSchedule = forced || (visitNo !== null && visitNo % VISIT_INTERVAL === 1)

  const cardState: 'cold' | 'searching' | 'ready' = !pixelPalSearchActive
    ? 'cold'
    : matchAvailabilityDemo === 'match_ready'
      ? 'ready'
      : 'searching'

  const visible =
    cardState === 'cold' ? visitNo !== null && !retired && !hasOngoing && onSchedule : true

  function handleFind() {
    retirePixelPalReminder()
    startMemberFlow(memberId)
    navigate('/m/how-it-works')
  }

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          key="pixel-pal-reminder"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="flex flex-col gap-6 rounded-card bg-lavender-20 p-3"
        >
          <div className="flex items-center gap-4">
            <div className="flex shrink-0 items-center justify-center rounded-icon bg-lavender-40 p-2">
              <RiHeart3Fill />
            </div>
            <p className="flex-1 text-card-title text-navy">Pixel Pal</p>
          </div>

          {cardState === 'cold' && (
            <>
              <div className="flex flex-col gap-1.5 text-navy-80">
                <p className="text-body-bold">Find someone who gets it</p>
                <p className="text-body">
                  Connect one-to-one with another patient who shares relevant experience.
                  We&rsquo;ll find a Pixel Pal based on what matters to you.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="secondary" className="border border-lavender" onClick={handleFind}>
                  Find a Pixel Pal
                </Button>
                <button
                  type="button"
                  onClick={retirePixelPalReminder}
                  className="min-h-11 shrink-0 whitespace-nowrap px-2 text-body-sm text-navy-60 underline-offset-4 hover:underline"
                >
                  Not now
                </button>
              </div>
            </>
          )}

          {cardState === 'searching' && (
            <>
              <div className="flex flex-col gap-1.5 text-navy-80">
                <p className="text-body-bold">We&rsquo;re looking for your Pixel Pal</p>
                <p className="text-body">We&rsquo;ll let you know when we find the right connection.</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  className="border border-lavender"
                  onClick={() => navigate('/m/no-match-yet')}
                >
                  View status
                </Button>
              </div>
            </>
          )}

          {cardState === 'ready' && (
            <>
              <div className="flex flex-col gap-1.5 text-navy-80">
                <p className="text-body-bold">Your Pixel Pal is ready</p>
                <p className="text-body">We&rsquo;ve found someone for you.</p>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="primary" onClick={() => navigate('/m/match-found')}>
                  Meet your Pixel Pal
                </Button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
