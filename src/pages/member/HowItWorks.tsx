import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ProgressDots } from '../../components/ui/ProgressDots'
import { Button } from '../../components/ui/Button'
import { useDemoStore } from '../../store/useDemoStore'

const cards = [
  "We'll suggest three people who've been where you are",
  'You choose who feels right and say hello',
  "They're peers, not medical staff — your care team is always one tap away",
]

/**
 * M2 · How it works (spec §7). Three swipeable cards + ProgressDots + Skip.
 *
 * No fork here. The original spec had this screen end with "What brings you
 * here?" — I'd like support / I'd like to support someone. That question is
 * real, but it belongs in front of this screen, not after it: two of the
 * three cards above are written for the Find side only, so asking after
 * showing them means half the audience has already swiped through content
 * that isn't theirs. It now lives on its own screen (`PixelPalFork`), and
 * everyone who reaches M2 has already answered it — via the fork, the Home
 * reminder card, or the demo controls. Re-asking here would be redundancy,
 * not a second data point.
 *
 * "← Back — dots — Skip", centered, matches P1 (`PalAbout.tsx`) — per direct
 * instruction to keep the two onboarding flows reading the same way. Back
 * always returns to the fork even though M2 has more than one real entry
 * point (the fork itself, the Home reminder card, Suggestions' "How Pixel
 * Pal works" link) — same simplification P1's own "← Back" already makes
 * for a screen reachable from several places, not a new inconsistency.
 */
export default function HowItWorks() {
  const navigate = useNavigate()
  const memberId = useDemoStore((s) => s.currentMemberId)
  const startMemberFlow = useDemoStore((s) => s.startMemberFlow)
  const prefersReducedMotion = useReducedMotion()
  const [step, setStep] = useState(0)

  const goNext = () => setStep((s) => Math.min(s + 1, cards.length - 1))
  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  function handleWantsSupport() {
    startMemberFlow(memberId)
    // No treatment step: her record already has it (silently prefilled in
    // memberFlow.draftTreatments by startMemberFlow) — never asked cold.
    navigate('/m/request/needs')
  }

  const isLastCard = step === cards.length - 1

  return (
    <div className="flex h-full flex-col p-5">
      {/* Back — dots (true-centered) — Skip, one row. A 3-column grid
          rather than `justify-between`: with only two flanking elements,
          `justify-between` centers the *gap*, not the dots themselves, and
          "← Back" / "Skip" aren't the same width. */}
      <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/m/pixel-pal')}
          className="justify-self-start text-label-bold text-navy-60 hover:text-navy"
        >
          ← Back
        </button>
        <ProgressDots total={cards.length} current={step} />
        <button
          type="button"
          onClick={handleWantsSupport}
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
            <p className="text-h4">{cards[step]}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" fullWidth={false} onClick={isLastCard ? handleWantsSupport : goNext}>
          {isLastCard ? "Let's go" : 'Next'}
        </Button>
      </div>
    </div>
  )
}
