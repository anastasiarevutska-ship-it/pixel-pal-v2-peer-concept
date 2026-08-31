import { useNavigate } from 'react-router-dom'
import { RequestStepHeader } from '../../components/RequestStepHeader'
import { Chip } from '../../components/ui/Chip'
import { Button } from '../../components/ui/Button'
import { useDemoStore } from '../../store/useDemoStore'
import { supportNeedLabels } from '../../lib/treatmentLabels'
import type { SupportNeed } from '../../lib/types'

const needs: SupportNeed[] = [
  'same_treatment',
  'emotional_side',
  'further_along',
  'practical_tips',
  'just_listen',
  'other',
]

/**
 * M3 step 1 of 2 — support-need chips, multi-select (spec §7).
 *
 * There is no separate "what treatment are you on" step: her record
 * already has that (silently prefilled into memberFlow.draftTreatments by
 * startMemberFlow) and it isn't fair to ask her to confirm it cold — the
 * whole app is built on TR already being known. It surfaces passively
 * later instead, e.g. in the suggestions' reason badges.
 */
export default function RequestNeeds() {
  const navigate = useNavigate()
  const draftNeeds = useDemoStore((s) => s.memberFlow.draftNeeds)
  const setDraftNeeds = useDemoStore((s) => s.setDraftNeeds)

  function toggle(need: SupportNeed) {
    setDraftNeeds(draftNeeds.includes(need) ? draftNeeds.filter((n) => n !== need) : [...draftNeeds, need])
  }

  return (
    <div className="flex h-full flex-col p-5">
      <RequestStepHeader
        step={0}
        total={2}
        onBack={() => navigate('/m/how-it-works')}
        title="What would help most"
      />
      <p className="mb-4 text-body-sm text-navy-60">Choose as many as feel right.</p>
      <div className="flex flex-wrap gap-2">
        {needs.map((need) => (
          <Chip
            key={need}
            label={supportNeedLabels[need]}
            selected={draftNeeds.includes(need)}
            onClick={() => toggle(need)}
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
