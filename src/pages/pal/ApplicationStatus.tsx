import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { useDemoStore } from '../../store/useDemoStore'

/**
 * P7 · You're a Pixel Pal — the moment right after `ApplyAttest` submits.
 *
 * No admin review, so no wait to explain and no timeline to draw: her
 * application *is* her becoming a Pal, the instant she sends it. This screen
 * is purely the acknowledgment beat — a "you're in" moment — not a status
 * page she'd ever return to (that's `PalEntry`'s job on later visits: a
 * profile existing sends her straight to `/pal/home`, never back here).
 */
export default function ApplicationStatus() {
  const navigate = useNavigate()
  const palId = useDemoStore((s) => s.palFlow.palId)
  const profile = useDemoStore((s) => s.palProfiles[palId])

  if (!profile) return <Navigate to="/pal/about" replace />

  return (
    <div className="flex min-h-full flex-col justify-center gap-4 p-6 text-center">
      <p className="text-label-bold uppercase text-lavender">You&rsquo;re all set</p>
      <h1 className="text-h3">Welcome to Pixel Pal</h1>
      <p className="text-body text-navy-60">
        Members whose experience lines up with yours can now reach out to you. You decide who to
        accept, and nothing happens without you saying yes.
      </p>
      <Button variant="primary" fullWidth={false} onClick={() => navigate('/pal/home')}>
        Go to your Pal home
      </Button>
    </div>
  )
}
