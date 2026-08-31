import { useNavigate } from 'react-router-dom'
import { RequestStepHeader } from '../../components/RequestStepHeader'
import { Button } from '../../components/ui/Button'
import { CapacityPicker } from './CapacityPicker'
import { useDemoStore } from '../../store/useDemoStore'

/**
 * P4 · Your capacity — application step 3 of 5.
 *
 * The single largest artificial constraint on supply today is that a
 * patient Pal is capped at one member, forever, by someone else (D4). Here
 * she sets it herself, 1–5, defaulting to 3.
 *
 * This is the same capacity concept employee Pals already have — the only
 * difference is who sets it and what the default is. Today's arrangement
 * gives the unpaid volunteer strictly less control over her own labor than
 * the paid staffer, which is indefensible once you say it out loud.
 */
export default function ApplyCapacity() {
  const navigate = useNavigate()
  const draftCapacity = useDemoStore((s) => s.palFlow.draftCapacity)
  const setPalDraftCapacity = useDemoStore((s) => s.setPalDraftCapacity)

  return (
    <div className="flex min-h-full flex-col p-5">
      <RequestStepHeader
        step={2}
        total={5}
        onBack={() => navigate('/pal/apply/story')}
        title="How many people can you support?"
      />
      <p className="-mt-2 mb-6 text-body-sm text-navy-60">
        Most Pals support three people at a time. You can change this whenever you like.
      </p>

      <CapacityPicker value={draftCapacity} onChange={setPalDraftCapacity} />

      <div className="mt-auto pt-6">
        <Button variant="primary" onClick={() => navigate('/pal/apply/reply-time')}>
          Continue
        </Button>
      </div>
    </div>
  )
}
