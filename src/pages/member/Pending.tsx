import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { useDemoStore } from '../../store/useDemoStore'
import { aboutMeOrFallback } from '../../lib/palDisplay'

// How long a request sits at "pending" before the calm still-waiting notice
// (below) offers her a way out that isn't just staring at the same screen.
const LONG_WAIT_MS = 24 * 60 * 60 * 1000

function MiniSuggestion({
  palId,
  actionable,
  onSayHello,
}: {
  palId: string
  actionable: boolean
  onSayHello: () => void
}) {
  const person = useDemoStore((s) => s.people[palId])
  const profile = useDemoStore((s) => s.palProfiles[palId])
  if (!person || !profile) return null
  return (
    <Card variant="standard" className="flex items-center gap-3">
      <Avatar name={person.displayName} src={person.avatarUrl} size="sm" />
      <div className="flex-1">
        <p className="text-body-sm-bold">{person.displayName}</p>
        <p className="text-label text-navy-60">{aboutMeOrFallback(profile.story)}</p>
      </div>
      {actionable && (
        <Button variant="secondary" fullWidth={false} onClick={onSayHello}>
          Say hello
        </Button>
      )}
    </Card>
  )
}

/**
 * M6 · Pending (spec §7). Calm, not a void. Her other suggestions are kept
 * (never discarded) so a decline never returns her to zero — but they only
 * *appear* once a decline actually happens. Showing them while she's still
 * waiting on the person she just chose would undercut that choice. Always
 * framed as availability, never "declined"/"rejected" (spec §10).
 */
export default function Pending() {
  const navigate = useNavigate()
  const currentRelationshipId = useDemoStore((s) => s.memberFlow.currentRelationshipId)
  const relationships = useDemoStore((s) => s.relationships)
  const shortlist = useDemoStore((s) => s.memberFlow.shortlist)
  const people = useDemoStore((s) => s.people)
  const memberId = useDemoStore((s) => s.currentMemberId)
  const withdrawRequest = useDemoStore((s) => s.withdrawRequest)
  const chooseSuggestion = useDemoStore((s) => s.chooseSuggestion)
  const acknowledgeWaiting = useDemoStore((s) => s.acknowledgeWaiting)
  const acknowledgeOutcome = useDemoStore((s) => s.acknowledgeOutcome)
  const findSomeoneElse = useDemoStore((s) => s.findSomeoneElse)
  const [confirmNewPalOpen, setConfirmNewPalOpen] = useState(false)

  const relationship = currentRelationshipId ? relationships[currentRelationshipId] : undefined
  // A decline no longer leaves a 'declined'-tagged entry sitting in the
  // shortlist to find — `backfillAfterDecline` (in the store) removes it and
  // pulls the next Pal in from the pool immediately, same as "Not for me"
  // always has. The branch below is unreachable through the normal flow now
  // that `useOngoingPalEntry` sends a decline straight to `/m/suggestions`
  // instead of here; left in place rather than deleted since a stale link
  // or direct navigation to `/m/pending` should still render *something*
  // sane rather than fall through to `return null` at the bottom.
  const declined = shortlist.find((s) => s.state === 'declined')
  const remaining = shortlist.filter((s) => s.state === 'offered')
  const isPending = relationship?.state === 'pending'
  const isConnected = relationship?.state === 'active' || relationship?.state === 'quiet'
  // Derived fresh from the actual timestamps every render — never a running
  // timer — so it's already correct on mount after a reload, a background/
  // resume, or coming back from another screen (spec: "not client-side
  // timer only").
  const isLongWait =
    isPending &&
    !!relationship &&
    !relationship.waitingAcknowledgedAt &&
    Date.now() - new Date(relationship.createdAt).getTime() >= LONG_WAIT_MS

  function handleChooseAnotherPal() {
    if (!relationship) return
    findSomeoneElse(memberId, relationship.id)
    setConfirmNewPalOpen(false)
    navigate('/m/suggestions')
  }

  useEffect(() => {
    // A Pal accepting (§9 demo control, or a real accept once Phase 2
    // exists) moves this thread straight to chat — never back to zero.
    if (isConnected && relationship) {
      navigate(`/m/chat/${relationship.id}`, { replace: true })
      return
    }
    if (!isPending && !declined) navigate('/m/suggestions', { replace: true })
  }, [isPending, isConnected, declined, relationship, navigate])

  // She's reached the screen that actually explains the decline — this is
  // what clears the Messages-tab dot and the Pixel Pal card's outcome
  // copy, not just a card mentioning it having rendered elsewhere.
  useEffect(() => {
    if (declined) acknowledgeOutcome()
  }, [declined, acknowledgeOutcome])

  function handleSayHelloTo(palId: string) {
    chooseSuggestion(palId)
    navigate('/m/say-hello')
  }

  if (isPending && relationship) {
    const pal = people[relationship.palId]
    return (
      <div className="relative flex h-full flex-col gap-6 p-5">
        <button
          type="button"
          onClick={() => navigate('/m')}
          className="self-start text-label-bold text-navy-60 hover:text-navy"
        >
          ← Home
        </button>
        <div>
          <h2 className="text-h3">Note sent</h2>
          <p className="mt-2 text-body text-navy-60">
            {pal?.displayName} will see your note and get back to you — usually within a day.
          </p>
        </div>

        {isLongWait ? (
          // Still `state: 'pending'` underneath — this only ever adds a
          // choice on top, never changes what the request is (see spec:
          // no auto-cancel/reject, no error framing). Same soft-notice
          // treatment as `autoPaused` on PalHome and QuietThreadNotice:
          // yellow-40, no icon, no urgency.
          <div className="rounded-card bg-yellow-40 p-4">
            <p className="text-body-sm-bold text-navy">Still waiting?</p>
            <p className="mt-1 text-body-sm text-navy-80">
              {pal?.displayName} may just need a little more time — that&rsquo;s okay. You&rsquo;re welcome to keep
              waiting, or choose another Pal if you&rsquo;d rather get started sooner.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Button variant="secondary" onClick={() => acknowledgeWaiting(relationship.id)}>
                Keep waiting
              </Button>
              <Button variant="ghost" onClick={() => setConfirmNewPalOpen(true)}>
                Choose another Pal
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" fullWidth={false} onClick={() => withdrawRequest(relationship.id)}>
            Withdraw
          </Button>
        )}

        <Modal
          isOpen={confirmNewPalOpen}
          onClose={() => setConfirmNewPalOpen(false)}
          title="Choose another Pal?"
        >
          <p className="mb-4 text-body-sm text-navy-60">
            Your note to {pal?.displayName} will be archived — she won&rsquo;t be told why. You&rsquo;ll get new
            suggestions right away.
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="primary" onClick={handleChooseAnotherPal}>
              Choose another Pal
            </Button>
            <Button variant="ghost" onClick={() => setConfirmNewPalOpen(false)}>
              Cancel
            </Button>
          </div>
        </Modal>
      </div>
    )
  }

  if (declined) {
    const pal = people[declined.palId]
    return (
      <div className="flex h-full flex-col gap-6 p-5">
        <button
          type="button"
          onClick={() => navigate('/m')}
          className="self-start text-label-bold text-navy-60 hover:text-navy"
        >
          ← Home
        </button>
        <div className="rounded-card bg-yellow-40 p-4">
          <p className="text-body text-navy-80">
            {pal?.displayName} isn&rsquo;t able to take someone new right now. Here are your other suggestions.
          </p>
        </div>
        {remaining.length > 0 ? (
          <div className="flex flex-col gap-2">
            {remaining.map((s) => (
              <MiniSuggestion
                key={s.palId}
                palId={s.palId}
                actionable
                onSayHello={() => handleSayHelloTo(s.palId)}
              />
            ))}
          </div>
        ) : (
          <Button variant="primary" onClick={() => navigate('/m/suggestions')}>
            See new suggestions
          </Button>
        )}
      </div>
    )
  }

  return null
}
