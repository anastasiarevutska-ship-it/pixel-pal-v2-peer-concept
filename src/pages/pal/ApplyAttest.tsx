import { useNavigate } from 'react-router-dom'
import { RequestStepHeader } from '../../components/RequestStepHeader'
import { Button } from '../../components/ui/Button'
import { useDemoStore } from '../../store/useDemoStore'
import type { PalProfile } from '../../lib/types'

type AttestationKey = keyof NonNullable<PalProfile['attestations']>

/**
 * P5 · Attestation — application step 5 of 5, and the submit step.
 *
 * Self-attestation, on its own, is what stands in for verification here —
 * there's no coordinator review behind it. It isn't a real gate, but it
 * creates a record and sets expectations in the Pal's own words before she
 * ever meets anyone, which costs nothing and beats today's silent
 * approval-by-not-being-rejected.
 *
 * The first item is the one that matters for liability (B2): the current
 * product asserts "no medical advice" inside a guidelines document nobody
 * reads at the moment of joy. Here she agrees to it herself, and it's
 * reinforced again in the composer on her first message.
 *
 * No minimum-distance-from-her-own-treatment requirement (B3) — dropped per
 * direct instruction, not an oversight. A Pal currently mid-cycle can still
 * apply.
 */
const items: { key: AttestationKey; label: string; detail: string }[] = [
  {
    key: 'experienceNotAdvice',
    label: 'I’ll share my experience, not medical advice',
    detail: 'What happened to you is exactly what she’s here for.',
  },
  {
    key: 'clinicalToCareTeam',
    label: 'I’ll point clinical questions to her care team',
    detail: 'There’s a one-tap handoff in every chat — you never have to improvise.',
  },
]

export default function ApplyAttest() {
  const navigate = useNavigate()
  const draftAttestations = useDemoStore((s) => s.palFlow.draftAttestations)
  const setPalDraftAttestation = useDemoStore((s) => s.setPalDraftAttestation)
  const submitPalApplication = useDemoStore((s) => s.submitPalApplication)

  const allChecked = items.every((item) => draftAttestations[item.key])

  function handleSubmit() {
    submitPalApplication()
    navigate('/pal/status')
  }

  return (
    <div className="flex min-h-full flex-col p-5">
      <RequestStepHeader
        step={4}
        total={5}
        onBack={() => navigate('/pal/apply/reply-time')}
        title="A few things to agree"
      />
      <p className="-mt-2 mb-4 text-body-sm text-navy-60">
        Short, and both matter. This is what keeps peer support safely non-clinical.
      </p>

      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const checked = draftAttestations[item.key]
          return (
            <label
              key={item.key}
              className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-field border p-3 transition-colors ${
                checked ? 'border-navy bg-lavender-20' : 'border-navy-20 bg-white hover:border-navy-40'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setPalDraftAttestation(item.key, e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-navy"
              />
              <span className="min-w-0">
                <span className="block text-body-sm-bold text-navy">{item.label}</span>
                <span className="block text-label text-navy-60">{item.detail}</span>
              </span>
            </label>
          )
        })}
      </div>

      <div className="mt-auto pt-6">
        <Button variant="primary" disabled={!allChecked} onClick={handleSubmit}>
          Become a Pixel Pal
        </Button>
      </div>
    </div>
  )
}
