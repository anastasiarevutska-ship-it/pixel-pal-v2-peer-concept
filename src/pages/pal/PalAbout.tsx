import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ProgressDots } from '../../components/ui/ProgressDots'
import { Button } from '../../components/ui/Button'
import { useDemoStore } from '../../store/useDemoStore'

const points = [
  {
    title: 'There’s a natural endpoint',
    body: "You’re supporting someone through one treatment cycle, not signing up forever.",
  },
  {
    title: 'Your experience, not advice',
    body: "You'll share what it was like for you. Anything clinical goes to her care team — there's a one-tap handoff inside every chat.",
  },
  {
    title: 'You set the pace',
    body: 'How many people you support, and whether you’re taking anyone new, is yours to change at any time.',
  },
]

/**
 * P1 · What this is (workshop §6.5 step 1).
 *
 * Deliberately honest about the size of the ask. Today's "Become a Pixel
 * Pal" is an open-ended emotional commitment with no stated endpoint, and
 * open-ended emotional commitments are the ones people decline (§5 B2).
 * Reframed as bounded — one person, one cycle — with the renewal moment
 * arriving later at graduation, when she already knows what it's like.
 *
 * The clinical boundary is stated here rather than only inside a guidelines
 * document, because it's also what makes the role feel doable: she is not
 * being asked to know anything medical.
 *
 * Cards presentation mirrors M2 (`HowItWorks.tsx`) exactly — no header copy,
 * one statement per screen, "← Back — dots — Skip" centered in one row,
 * swipeable, no standalone dismissal button below — per direct instruction
 * to keep the two onboarding flows reading the same way. No separate "Get
 * started" button: she already made that call tapping "Become a Pixel Pal"
 * on the fork, so `startPalApplication` fires from the same place Find's
 * `Skip`/"Let's go" fires from — reaching the end of the cards (or skipping
 * past them) *is* getting started, not a second confirmation of it. "← Back"
 * is still the way out, same as M2.
 */
export default function PalAbout() {
  const navigate = useNavigate()
  const startPalApplication = useDemoStore((s) => s.startPalApplication)
  const prefersReducedMotion = useReducedMotion()
  const [step, setStep] = useState(0)

  const goNext = () => setStep((s) => Math.min(s + 1, points.length - 1))
  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  function handleStart() {
    startPalApplication()
    navigate('/pal/apply/experience')
  }

  const isLastCard = step === points.length - 1

  return (
    // Reached from the fork's "Become a Pixel Pal", the graduation ask, and
    // the demo control's "Apply" button — all on the Requester side. "← Back"
    // returns to the fork (where the choice was made) — the only way out,
    // now that "Not right now" is gone (per direct instruction).
    //
    // No header copy above the cards — per direct instruction, the eyebrow/
    // title/lede that used to introduce the three points is gone, so this
    // opens straight into the carousel rather than a marketing screen that
    // happens to have swipeable cards below it.
    <div className="flex h-full flex-col p-5">
      {/* Back — dots (true-centered) — Skip, one row. A 3-column grid
          rather than `justify-between`: with only two flanking elements,
          `justify-between` centers the *gap*, not the dots themselves, and
          "← Back" / "Skip" aren't the same width. */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/m/pixel-pal')}
          className="justify-self-start text-label-bold text-navy-60 hover:text-navy"
        >
          ← Back
        </button>
        <ProgressDots total={points.length} current={step} />
        <button
          type="button"
          onClick={handleStart}
          className="justify-self-end text-label-bold text-navy-60 hover:text-navy"
        >
          Skip
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_event, info) => {
              if (info.offset.x < -60) goNext()
              else if (info.offset.x > 60) goBack()
            }}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="cursor-grab rounded-card bg-white p-6 text-center shadow-card active:cursor-grabbing"
          >
            <p className="text-body-bold">{points[step].title}</p>
            <p className="mt-2 text-body-sm text-navy-60">{points[step].body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" fullWidth={false} onClick={isLastCard ? handleStart : goNext}>
          {isLastCard ? "Let's go" : 'Next'}
        </Button>
      </div>
    </div>
  )
}
