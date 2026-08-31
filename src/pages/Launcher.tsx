import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Toast } from '../components/ui/Toast'
import { useDemoStore } from '../store/useDemoStore'
import pixelLogo from '../assets/brand/pixel-logo.svg'
import iconUserHeart from '../assets/contact/icon-user-heart.svg'
import iconPeopleHeart from '../assets/contact/icon-people-heart.svg'

// Same icon pairing as `PixelPalFork` (M1's Member/Pal fork): user-heart for
// finding support yourself, people-heart for offering it to others — reused
// here rather than invented, so the two entry points read as the same two
// perspectives the product already uses that iconography for.
const roles = [
  {
    to: '/m',
    icon: iconUserHeart,
    title: 'Member experience',
    description: 'Find support from someone who’s been there.',
  },
  {
    to: '/pal',
    icon: iconPeopleHeart,
    title: 'Pal experience',
    description: 'Be there for someone — on your own terms.',
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
        <p className="text-label-bold uppercase text-lavender">Pixel Pal · Concept exploration</p>
        <h1 className="mt-2 text-display">Reimagining the Pixel Pal experience</h1>
      </div>

      <p className="mt-6 max-w-2xl text-center text-body text-navy-60">
        A concept prototype exploring how Pixel Pal could feel more human, supportive, and
        sustainable — for both members and Pals.
      </p>

      <div className="mt-20 grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        {roles.map((role) => (
          <Link key={role.to} to={role.to} className="block">
            <Card className="flex h-full cursor-pointer flex-col gap-3 transition-transform hover:-translate-y-0.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-field bg-navy p-2.5">
                <img src={role.icon} alt="" aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-h4">{role.title}</p>
                <p className="mt-1 text-body-sm text-navy-60">{role.description}</p>
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
