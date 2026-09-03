import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { useDemoStore } from '../../store/useDemoStore'

/**
 * V2 "We're still looking" — the No Match Yet branch out of
 * `PixelPalFinding`. Simple waiting state on its own; reaching this screen
 * is also what marks `pixelPalSearchActive` (via `beginPixelPalSearch`), so
 * Home's `PixelPalReminderCard` switches from the cold promotional card to
 * the searching/ready status card — see that component's docblock.
 *
 * No Back button: her search has already started by the time she's here —
 * a terminal outcome of setup/matching, not a step to navigate backward out
 * of. "Back to home" is the only way off this screen.
 */
export default function PixelPalNoMatchYet() {
  const navigate = useNavigate()
  const beginPixelPalSearch = useDemoStore((s) => s.beginPixelPalSearch)

  // Marks the prototype's waiting state — she's completed the No Match Yet
  // branch, regardless of how she leaves this screen from here.
  useEffect(() => {
    beginPixelPalSearch()
  }, [beginPixelPalSearch])

  return (
    <div className="flex min-h-full flex-col gap-6 p-5">
      <h1 className="text-screen-title text-navy">Pixel Pal</h1>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <h2 className="text-h3">We&rsquo;re still looking</h2>
        <p className="text-body text-navy-60">
          We haven&rsquo;t found the right connection just yet. You don&rsquo;t need to stay here
          — we&rsquo;ll let you know when your Pixel Pal is ready.
        </p>
      </div>

      <div className="pt-6">
        <Button variant="primary" onClick={() => navigate('/home')}>
          Back to home
        </Button>
      </div>
    </div>
  )
}
