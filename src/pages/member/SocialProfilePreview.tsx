import { useNavigate } from 'react-router-dom'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { useDemoStore } from '../../store/useDemoStore'

// Standard Instagram glyph (rounded square + lens + flash dot), inline SVG —
// same pattern as `ScreenHeader`'s back-chevron and the other icon function
// components in this codebase, since there's no icon library dependency to
// pull from instead.
function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-navy"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

/**
 * V2 Social Profile preview — the last onboarding step before matching,
 * shown so the patient sees exactly what her Pixel Pal will see before we
 * start looking (see docs/pixel-pal-v2-source-of-truth.md).
 *
 * Reuses the existing Social Profile data already on `people[memberId]` —
 * the same record ContactsEntry's header avatar reads — rather than a
 * separate Pixel Pal profile. No re-entry, no new fields.
 *
 * Social links render as a platform icon (Instagram, currently the only one
 * recognized), never as the raw URL — this is a preview of what her Pixel
 * Pal will see, not a place to expose the literal link text.
 *
 * Group membership is deliberately never shown here — it's managed by the
 * separate Groups/Community feature, not this profile.
 *
 * Location and treatment are deliberately never surfaced here.
 *
 * "Edit social profile" opens `SocialProfileEdit` (`/m/social-profile-edit`),
 * which edits this same `Person` record — not a second profile system. It
 * returns here on both Save and Cancel, so this screen always re-reads the
 * current store values (immediately reflecting a save, unchanged after a
 * cancel) rather than caching anything itself.
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
        {member?.signature && <p className="text-body-sm text-navy-60">{member.signature}</p>}
        {member?.aboutMe && <p className="text-body-sm text-navy">{member.aboutMe}</p>}
        {member?.socialLinks?.some((link) => link.toLowerCase().includes('instagram')) && (
          <div className="flex justify-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-icon bg-lavender-40">
              <InstagramIcon />
            </span>
          </div>
        )}
      </Card>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <Button variant="secondary" onClick={() => navigate('/m/social-profile-edit')}>
          Edit social profile
        </Button>
        <Button variant="primary" onClick={() => navigate('/m/finding')}>
          Looks good
        </Button>
      </div>
    </div>
  )
}
