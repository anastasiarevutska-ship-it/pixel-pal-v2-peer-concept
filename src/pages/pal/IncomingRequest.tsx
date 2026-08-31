import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Tag } from '../../components/ui/Tag'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { useDemoStore } from '../../store/useDemoStore'
import { formatTreatments, supportNeedLabels, treatmentLabels } from '../../lib/treatmentLabels'

/**
 * P9 · A request arrives (workshop §6.5 step 4) — the other half of the
 * concept's central argument.
 *
 * Today a match is imposed on both sides: neither party can accept,
 * decline, or preview (§2.2D). Here she decides, and she decides with real
 * information — what the member is going through, what she said would help,
 * and above all the intro note.
 *
 * The note is why this screen works (§5 A3). Without it, accept/decline is
 * a judgment passed on a stranger's profile. With it, it's a response to a
 * person who has already said hello.
 *
 * "Not right now" is private, costs nothing, and asks for no reason. The
 * member is only ever told about availability — never that a decision was
 * made about her.
 */
export default function IncomingRequest() {
  const { relationshipId = '' } = useParams()
  const navigate = useNavigate()
  const palId = useDemoStore((s) => s.palFlow.palId)
  const profile = useDemoStore((s) => s.palProfiles[palId])
  const relationship = useDemoStore((s) => s.relationships[relationshipId])
  const relationships = useDemoStore((s) => s.relationships)
  const member = useDemoStore((s) => s.people[relationship?.memberId ?? ''])
  const memberRequests = useDemoStore((s) => s.memberRequests)
  const acceptPalRequest = useDemoStore((s) => s.acceptPalRequest)
  const declinePalRequest = useDemoStore((s) => s.declinePalRequest)
  const setPalAvailability = useDemoStore((s) => s.setPalAvailability)

  const [declineOpen, setDeclineOpen] = useState(false)

  if (!profile) return <Navigate to="/pal/about" replace />

  if (!relationship || !member) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <p className="text-body text-navy-60">This request isn&rsquo;t here anymore.</p>
      </div>
    )
  }

  const request = Object.values(memberRequests)
    .filter((r) => r.memberId === relationship.memberId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]

  const ongoing = Object.values(relationships).filter(
    (r) => r.palId === palId && (r.state === 'active' || r.state === 'quiet'),
  ).length
  const atCapacity = ongoing >= profile.capacity

  function handleAccept() {
    acceptPalRequest(relationship.id)
    navigate(`/pal/chat/${relationship.id}`, { replace: true })
  }

  function handleDecline() {
    declinePalRequest(relationship.id)
    setDeclineOpen(false)
    navigate('/pal/home', { replace: true })
  }

  // Not the same decision as "Not right now" below: that's about this one
  // request. This is "stop sending me new people for a while" — the global
  // availability switch, which also closes out this pending request and any
  // other one currently sitting with her (see `setPalAvailability`). It's
  // deliberately not called "pause" — that word is reserved for stepping
  // away from one live conversation (PalChat's "Pause this conversation"),
  // a different, narrower action this screen doesn't offer.
  function handleNotTakingNew() {
    setPalAvailability('not_taking_new')
    navigate('/pal/home', { replace: true })
  }

  return (
    <div className="relative flex min-h-full flex-col gap-6 p-5">
      <ScreenHeader title="A request arrived" onBack={() => navigate('/pal/home')} />

      <div className="flex items-center gap-3">
        <Avatar name={member.displayName} src={member.avatarUrl} size="lg" />
        <div className="min-w-0">
          <p className="text-h3">{member.displayName}</p>
          <p className="text-body-sm text-navy-60">
            {request?.treatments.length
              ? `Going through ${formatTreatments(request.treatments)}`
              : 'In treatment right now'}
          </p>
        </div>
      </div>

      {/* Her note — the reason this decision is informed at all */}
      <Card variant="standard" className="mt-5 flex flex-col gap-2 border-l-4 border-lavender">
        <p className="text-label-bold uppercase text-navy-60">She wrote to you</p>
        <p className="text-body text-navy-80">{relationship.introNote}</p>
      </Card>

      {request && request.needs.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-label-bold uppercase text-navy-60">What she said would help</p>
          <div className="flex flex-col gap-1.5">
            {request.needs.map((need) => (
              <p key={need} className="text-body-sm text-navy-80">
                · {supportNeedLabels[need]}
              </p>
            ))}
          </div>
        </div>
      )}

      {request && request.treatments.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-label-bold uppercase text-navy-60">Her treatment</p>
          <div className="flex flex-wrap gap-2">
            {request.treatments.map((code) => (
              <Tag key={code}>{treatmentLabels[code]?.acronym ?? treatmentLabels[code]?.label ?? code}</Tag>
            ))}
          </div>
        </div>
      )}

      <p className="mt-5 rounded-field bg-lavender-20 px-3 py-2 text-body-sm text-navy-80">
        {relationship.sharedContext} That&rsquo;s why she was shown your profile.
      </p>

      {atCapacity && (
        <p className="mt-3 rounded-field bg-yellow-40 px-3 py-2 text-body-sm text-navy-80">
          You&rsquo;re at your limit of {profile.capacity} right now. You can still say yes — or raise
          your limit on your Pal home first.
        </p>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-8">
        <Button variant="primary" onClick={handleAccept}>
          Say yes to {member.displayName}
        </Button>
        <Button variant="ghost" onClick={() => setDeclineOpen(true)}>
          Not right now
        </Button>
        <button
          type="button"
          onClick={handleNotTakingNew}
          className="min-h-11 text-body-sm text-navy-60 underline-offset-4 hover:underline"
        >
          I&rsquo;m not taking new right now
        </button>
      </div>

      <Modal isOpen={declineOpen} onClose={() => setDeclineOpen(false)} title="Not right now?">
        <p className="mb-4 text-body-sm text-navy-60">
          {member.displayName} won&rsquo;t be told you said no, and she isn&rsquo;t left with nothing
          — she still has her other suggestions. You don&rsquo;t need to give a reason.
        </p>
        <div className="flex flex-col gap-2">
          <Button variant="primary" onClick={handleDecline}>
            Yes, not right now
          </Button>
          <Button variant="ghost" onClick={() => setDeclineOpen(false)}>
            Go back
          </Button>
        </div>
      </Modal>
    </div>
  )
}
