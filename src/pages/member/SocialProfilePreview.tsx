import { useNavigate } from 'react-router-dom'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { useDemoStore } from '../../store/useDemoStore'

/**
 * V2 Social Profile preview — the last onboarding step before matching,
 * shown so the patient sees exactly what her Pixel Pal will see before we
 * start looking (see docs/pixel-pal-v2-source-of-truth.md).
 *
 * Reuses the existing Social Profile data already on `people[memberId]` —
 * the same record ContactsEntry's header avatar reads — rather than a
 * separate Pixel Pal profile. No re-entry, no new fields.
 *
 * `Person` has no `aboutMe` yet — that field currently only exists on
 * `PalProfile.story`, written during the (legacy) Pal application. So this
 * screen has nothing to show for About Me for a patient in today's seed
 * data, and intentionally shows nothing rather than inventing placeholder
 * copy. Add the section here once About Me exists on `Person` itself.
 *
 * Location and treatment are deliberately never surfaced here.
 *
 * "Edit social profile" is a prototype-only affordance: there's no existing
 * Social Profile edit destination for a patient in this prototype (the only
 * "edit profile" screen, `PalEdit`, belongs to the separate legacy Pal
 * profile and mixes in Pal-only fields like capacity/availability), so the
 * button is present but intentionally not wired to a real flow yet.
 *
 * "Looks good" continues to `PixelPalFinding` (`/m/finding`), the V2
 * "Finding your Pixel Pal" loading state — not the legacy Suggestions
 * screen.
 */
export default function SocialProfilePreview() {
  const navigate = useNavigate()
  const memberId = useDemoStore((s) => s.currentMemberId)
  const member = useDemoStore((s) => s.people[memberId])

  return (
    <div className="flex min-h-full flex-col gap-6 p-5">
      <ScreenHeader title="Social Profile" onBack={() => navigate('/m/request/note')} />

      <div>
        <h2 className="text-h3">This is how your Pixel Pal will see you</h2>
        <p className="mt-2 text-body-sm text-navy-60">
          You can update your Social Profile before we start looking.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <Avatar name={member?.displayName ?? ''} src={member?.avatarUrl || undefined} size="xl" />
        <p className="text-h4 text-navy">{member?.displayName}</p>
      </Card>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <Button variant="secondary">Edit social profile</Button>
        <Button variant="primary" onClick={() => navigate('/m/finding')}>
          Looks good
        </Button>
      </div>
    </div>
  )
}
