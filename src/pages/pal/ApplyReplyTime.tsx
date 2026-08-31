import { useNavigate } from 'react-router-dom'
import { RequestStepHeader } from '../../components/RequestStepHeader'
import { Button } from '../../components/ui/Button'
import { ReplyTimePicker } from './ReplyTimePicker'
import { useDemoStore } from '../../store/useDemoStore'

/**
 * P4.5 · Expected reply time — application step 4 of 5.
 *
 * An honest expectation instead of an assumed one. Today's product hardcodes
 * "usually replies within a day" for everyone; here it's her own estimate,
 * feeding the same responsiveness signal `rankPals.ts` already ranks on —
 * so a member's shortlist reflects a Pal's actual stated pace, not a guess.
 */
export default function ApplyReplyTime() {
  const navigate = useNavigate()
  const draftReplyHours = useDemoStore((s) => s.palFlow.draftReplyHours)
  const setPalDraftReplyHours = useDemoStore((s) => s.setPalDraftReplyHours)

  return (
    <div className="flex min-h-full flex-col p-5">
      <RequestStepHeader
        step={3}
        total={5}
        onBack={() => navigate('/pal/apply/capacity')}
        title="How quickly do you usually reply?"
      />
      <p className="-mt-2 mb-4 text-body-sm text-navy-60">
        A rough guess is fine — members see this so they know what to expect, and you can
        change it any time.
      </p>

      <ReplyTimePicker value={draftReplyHours} onChange={setPalDraftReplyHours} />

      <div className="mt-auto pt-6">
        <Button variant="primary" onClick={() => navigate('/pal/apply/attest')}>
          Continue
        </Button>
      </div>
    </div>
  )
}
