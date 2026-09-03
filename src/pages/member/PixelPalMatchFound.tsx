import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { mockMatch } from '../../lib/mockPixelPal'

/**
 * V2 "Meet your Pixel Pal" — the Match Found branch out of
 * `PixelPalFinding`. Deliberately minimal: one mocked profile, no accept/
 * decline, no comparison, no second match. "Say hello" opens `PixelPalChat`
 * (`/m/pixel-pal-chat`) directly — no intermediate confirmation screen.
 *
 * No Back button: the match is already created automatically by the time
 * she reaches this screen, so there's nothing here to reconsider or rerun.
 */
export default function PixelPalMatchFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-full flex-col gap-6 p-5">
      <h1 className="text-screen-title text-navy">Pixel Pal</h1>

      <h2 className="text-h3">Meet your Pixel Pal</h2>

      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <Avatar name={mockMatch.alias} size="xl" />
        <p className="text-h4 text-navy">{mockMatch.alias}</p>
        {mockMatch.aboutMe && <p className="text-body-sm text-navy-60">{mockMatch.aboutMe}</p>}
      </Card>

      <p className="text-body text-navy-60">You have some treatment experience in common.</p>

      <div className="mt-auto pt-6">
        <Button variant="primary" onClick={() => navigate('/m/pixel-pal-chat')}>
          Say hello
        </Button>
      </div>
    </div>
  )
}
