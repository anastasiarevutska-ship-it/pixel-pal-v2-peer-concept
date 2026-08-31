import { useNavigate } from 'react-router-dom'
import { RequestStepHeader } from '../../components/RequestStepHeader'
import { TextArea } from '../../components/ui/TextArea'
import { Button } from '../../components/ui/Button'
import { useDemoStore } from '../../store/useDemoStore'

/** M3 step 2 of 2 — optional note, skippable. No blank-page bio (spec §7). */
export default function RequestNote() {
  const navigate = useNavigate()
  const memberId = useDemoStore((s) => s.currentMemberId)
  const draftNote = useDemoStore((s) => s.memberFlow.draftNote)
  const setDraftNote = useDemoStore((s) => s.setDraftNote)
  const submitMemberRequest = useDemoStore((s) => s.submitMemberRequest)

  function handleSubmit() {
    submitMemberRequest(memberId)
    navigate('/m/suggestions')
  }

  return (
    <div className="flex h-full flex-col p-5">
      <RequestStepHeader step={1} total={2} onBack={() => navigate('/m/request/needs')} title="Anything else?" />
      <p className="mb-4 text-body-sm text-navy-60">Optional — anything that would help us match you well.</p>
      <TextArea
        value={draftNote}
        onChange={(e) => setDraftNote(e.target.value)}
        placeholder="Share as much or as little as you'd like…"
        rows={5}
      />
      <div className="mt-auto pt-6">
        <Button variant="primary" onClick={handleSubmit}>
          {draftNote ? 'Continue' : 'Skip'}
        </Button>
      </div>
    </div>
  )
}
