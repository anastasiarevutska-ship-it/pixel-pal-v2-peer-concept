import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDemoStore } from '../../store/useDemoStore'

/** How long the prototype "looking" pause lasts before branching — pacing
 * only, not a real fetch. Same spirit as Suggestions' ~1.2s warm pause,
 * just long enough for all three status lines to read as real progress. */
const LOOKING_MS = 2200

const statusLines = [
  'Considering your preferences',
  'Looking for relevant shared experience',
  "Checking who's available",
]

/**
 * V2 "Finding your Pixel Pal" — prototype-only loading state between the
 * Social Profile preview (or "Find someone else", from `PixelPalChat`) and
 * a matching outcome. No real matching runs here: after a fixed pause it
 * reads `matchOutcomeDemo`, the presentation-only flag set from
 * DemoControls' "Match outcome" toggle (member side), and branches to the
 * mocked Match Found or No Match Yet screen. The real matching algorithm is
 * still an open product question — see docs/pixel-pal-v2-source-of-truth.md.
 *
 * Also clears `pixelPalMatchEnded` on mount — reaching this screen always
 * means a fresh cycle is starting, whether that's the very first match or a
 * re-match after "Find someone else", so any earlier "that connection
 * ended" flag shouldn't carry over onto whatever this cycle produces.
 */
export default function PixelPalFinding() {
  const navigate = useNavigate()
  const matchOutcomeDemo = useDemoStore((s) => s.matchOutcomeDemo)
  const beginNewPixelPalMatch = useDemoStore((s) => s.beginNewPixelPalMatch)

  useEffect(() => {
    beginNewPixelPalMatch()
  }, [beginNewPixelPalMatch])

  useEffect(() => {
    const t = setTimeout(() => {
      navigate(matchOutcomeDemo === 'no_match_yet' ? '/m/no-match-yet' : '/m/match-found', {
        replace: true,
      })
    }, LOOKING_MS)
    return () => clearTimeout(t)
  }, [navigate, matchOutcomeDemo])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
      <div
        className="h-10 w-10 animate-spin rounded-pill border-2 border-lavender border-t-transparent"
        aria-hidden="true"
      />
      <div>
        <h2 className="text-h3">Finding your Pixel Pal</h2>
        <p className="mt-2 text-body text-navy-60">
          We&rsquo;re looking for someone who fits what matters to you.
        </p>
      </div>
      <div className="flex flex-col gap-1.5 text-body-sm text-navy-60">
        {statusLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  )
}
