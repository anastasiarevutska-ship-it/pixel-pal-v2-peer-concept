import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Toast } from '../components/ui/Toast'
import { useDemoStore } from '../store/useDemoStore'
import pixelLogo from '../assets/brand/pixel-logo.svg'
import iconPeopleHeart from '../assets/contact/icon-people-heart.svg'

// V2 is a single peer-to-peer concept, not a role split — one entry point
// into the existing Main App patient experience. The people-heart icon is
// kept from the old Pal-experience card: it's the pairing icon (see
// ContactsEntry's docblock), not one side of a role, so it still reads
// correctly here.
const entries = [
  {
    to: '/m',
    icon: iconPeopleHeart,
    title: 'Pixel Pal V2',
    description: 'Explore the peer-to-peer patient experience.',
  },
]

/**
 * Route "/" — the presentation cover for the concept walkthrough: a quiet,
 * editorial front door into the Member and Pal journeys, plus Reset demo.
 *
 * Coordinator and the dev-only reference links (design tokens, app home)
 * are deliberately not offered here — this is a client-facing cover, not a
 * build index. Those surfaces still exist as routes for internal use, just
 * unlinked from the front door.
 */
export default function Launcher() {
  const resetDemo = useDemoStore((s) => s.resetDemo)
  const [showResetToast, setShowResetToast] = useState(false)

  function handleReset() {
    resetDemo()
    setShowResetToast(true)
    setTimeout(() => setShowResetToast(false), 2000)
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-lavender-20 p-10">
      <img src={pixelLogo} alt="Pixel Care" className="h-[88px] w-[88px]" />

      <div className="mt-2 max-w-2xl text-center">
        <p className="text-label-bold uppercase text-lavender">Pixel Pal · Peer connection concept</p>
        <h1 className="mt-2 text-display">Reimagining the Pixel Pal experience</h1>
      </div>

      <p className="mt-6 max-w-2xl text-center text-body text-navy-60">
        A concept exploring a simpler, peer-to-peer way for patients to connect through shared
        fertility treatment experience.
      </p>

      <div className="mt-20 grid w-full max-w-2xl gap-4 sm:grid-cols-1">
        {entries.map((entry) => (
          <Link key={entry.to} to={entry.to} className="block">
            <Card className="flex h-full cursor-pointer flex-col gap-3 transition-transform hover:-translate-y-0.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-field bg-navy p-2.5">
                <img src={entry.icon} alt="" aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-h4">{entry.title}</p>
                <p className="mt-1 text-body-sm text-navy-60">{entry.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* A demo utility, not part of the presentation story — quiet text
          action, same weight as the reference links this replaced, never a
          second call to action beside the journey cards above. */}
      <button
        type="button"
        onClick={handleReset}
        className="mt-10 text-label text-navy-60 transition-colors hover:text-navy"
      >
        ↺ Reset demo
      </button>

      <Toast message="Demo reset — back to the seed." isOpen={showResetToast} />
    </div>
  )
}
