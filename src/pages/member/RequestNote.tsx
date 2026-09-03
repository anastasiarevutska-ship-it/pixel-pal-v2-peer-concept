import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RequestStepHeader } from '../../components/RequestStepHeader'
import { Chip } from '../../components/ui/Chip'
import { Button } from '../../components/ui/Button'
import { useDemoStore } from '../../store/useDemoStore'

type LocationPreference = 'outside_local_area' | 'no_preference'

const locationOptions: { id: LocationPreference; label: string }[] = [
  { id: 'outside_local_area', label: 'Yes, outside my local area' },
  { id: 'no_preference', label: "No, location doesn't matter to me" },
]

/**
 * M3 step 2 of 2 — location preference (V2 peer concept).
 *
 * Illustrative prototype behavior only, same pattern as RequestNeeds'
 * treatment-experience preference: kept in local state, not wired into the
 * store or any real geographic matching. Location itself is never shown to
 * a Pixel Pal — it's an internal matching/privacy constraint only: "Yes,
 * outside my local area" means she prefers not to be matched with someone
 * local to her; "No, location doesn't matter to me" means location doesn't
 * restrict the match. Location is never a positive matching signal (no
 * "nearby" boost) — see docs/pixel-pal-v2-source-of-truth.md.
 *
 * `submitMemberRequest` still runs on Continue — it just no longer carries a
 * free-text note — but Continue leads to the V2 Social Profile preview
 * (`SocialProfilePreview`, `/m/social-profile-preview`), not the legacy
 * Suggestions screen.
 */
export default function RequestNote() {
  const navigate = useNavigate()
  const memberId = useDemoStore((s) => s.currentMemberId)
  const submitMemberRequest = useDemoStore((s) => s.submitMemberRequest)
  const [preference, setPreference] = useState<LocationPreference | null>(null)

  function handleSubmit() {
    submitMemberRequest(memberId)
    navigate('/m/social-profile-preview')
  }

  return (
    <div className="flex h-full flex-col p-5">
      <RequestStepHeader
        step={1}
        total={2}
        onBack={() => navigate('/m/request/needs')}
        title="Do you have a preference regarding location?"
      />
      <p className="mb-4 text-body-sm text-navy-60">
        Your location is never shown to your Pixel Pal.
      </p>
      <div className="flex flex-wrap gap-2">
        {locationOptions.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selected={preference === option.id}
            onClick={() => setPreference(option.id)}
          />
        ))}
      </div>
      <div className="mt-auto pt-6">
        <Button variant="primary" onClick={handleSubmit}>
          Continue
        </Button>
      </div>
    </div>
  )
}
