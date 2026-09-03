import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RequestStepHeader } from '../../components/RequestStepHeader'
import { Chip } from '../../components/ui/Chip'
import { Button } from '../../components/ui/Button'

type TreatmentPreference = 'similar_experience' | 'no_preference'

const preferenceOptions: { id: TreatmentPreference; label: string }[] = [
  { id: 'similar_experience', label: 'Yes, if possible' },
  { id: 'no_preference', label: 'No preference' },
]

/**
 * M3 step 1 of 2 — treatment-experience preference, single-select (V2 peer
 * concept). Replaces the earlier journey-stage/"who to connect with"
 * question: journey stage (currently going through vs. previously went
 * through) is no longer a separate preference — "Yes, if possible" covers
 * both. See docs/pixel-pal-v2-source-of-truth.md's Matching preferences
 * section.
 *
 * Illustrative prototype behavior only: the selection is kept in local
 * component state rather than the shared demo store, since there is no
 * defined matching algorithm yet for it to feed. Do not wire this into real
 * matching logic until that's specified.
 */
export default function RequestNeeds() {
  const navigate = useNavigate()
  const [preference, setPreference] = useState<TreatmentPreference | null>(null)

  return (
    <div className="flex h-full flex-col p-5">
      <RequestStepHeader
        step={0}
        total={2}
        onBack={() => navigate('/m/how-it-works')}
        title="Would you prefer someone with similar treatment experience?"
      />
      <p className="mb-4 text-body-sm text-navy-60">
        We'll use this as a preference when looking for your Pixel Pal.
      </p>
      <div className="flex flex-wrap gap-2">
        {preferenceOptions.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selected={preference === option.id}
            onClick={() => setPreference(option.id)}
          />
        ))}
      </div>
      <div className="mt-auto pt-6">
        <Button variant="primary" onClick={() => navigate('/m/request/note')}>
          Continue
        </Button>
      </div>
    </div>
  )
}
