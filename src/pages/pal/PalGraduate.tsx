import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useDemoStore } from '../../store/useDemoStore'

type Phase = 'thanks' | 'wellbeing' | 'renew'

/**
 * P11 · Wrapping up (workshop §6.5 step 5) — closure for the Pal, which
 * today does not exist in any form. A volunteer currently never learns
 * whether she helped: the post-conversation survey is collected from the
 * member and surfaced to nobody (§2.2G).
 *
 * Three beats, in this order on purpose:
 *
 * 1. **Her thank-you, passed through.** The member's gratitude is the
 *    reinforcement loop the product has never closed.
 * 2. **The wellbeing check** (§5 C4). She has just absorbed someone else's
 *    outcome, often while carrying her own history of it. Nobody in this
 *    space does this, it costs one screen, and the "that was heavy" path
 *    leads straight to a pause rather than to a form.
 * 3. **The renewal choice** — support someone else, or stop for now. Asked
 *    once, at the moment she knows what she's agreeing to, and a break is
 *    presented as an equal option rather than a failure to re-commit.
 */
export default function PalGraduate() {
  const { relationshipId = '' } = useParams()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const palId = useDemoStore((s) => s.palFlow.palId)
  const relationship = useDemoStore((s) => s.relationships[relationshipId])
  const member = useDemoStore((s) => s.people[relationship?.memberId ?? ''])
  const profile = useDemoStore((s) => s.palProfiles[palId])
  const graduateRelationship = useDemoStore((s) => s.graduateRelationship)
  const setPalAvailability = useDemoStore((s) => s.setPalAvailability)

  const [phase, setPhase] = useState<Phase>('thanks')

  useEffect(() => {
    // `seenByPal: true` — she's live on this screen watching it happen, so
    // there's nothing to leave as an unread closure moment for her to find
    // later (that's `PalGraduationMoment`, for the Requester-initiated
    // case where she isn't here for it).
    if (relationship && relationship.state !== 'graduated') {
      graduateRelationship(relationship.id, { seenByPal: true })
    }
  }, [relationship, graduateRelationship])

  if (!relationship || !member) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <p className="text-body text-navy-60">Conversation not found.</p>
      </div>
    )
  }

  const messagesSent = relationship.messages.filter((m) => m.senderId === palId).length
  const supported = profile?.supportedCount ?? 0

  const fade = {
    initial: prefersReducedMotion ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  }

  return (
    <div className="flex min-h-full flex-col justify-center gap-6 p-6">
      {phase === 'thanks' && (
        <motion.div {...fade} className="flex flex-col gap-4 text-center">
          <p className="text-label-bold uppercase text-lavender">Wrapped up</p>
          <h1 className="text-h3">{member.displayName} wanted you to know</h1>
          <Card variant="standard" className="text-left">
            <p className="text-body text-navy-80">
              &ldquo;I don&rsquo;t think I could have got through the waiting without you. Thank you
              for being honest with me instead of just telling me it would be fine.&rdquo;
            </p>
          </Card>
          <div className="rounded-card bg-lavender-20 p-4 text-left">
            <p className="text-body-sm-bold text-navy">
              {supported > 0
                ? `That’s ${supported} ${supported === 1 ? 'person' : 'people'} you’ve seen through.`
                : 'That’s one person you’ve seen through.'}
            </p>
            <p className="mt-1 text-label text-navy-60">
              {messagesSent} {messagesSent === 1 ? 'message' : 'messages'} in this conversation · only
              you see this
            </p>
          </div>
          <Button variant="primary" onClick={() => setPhase('wellbeing')}>
            Continue
          </Button>
        </motion.div>
      )}

      {phase === 'wellbeing' && (
        <motion.div {...fade} className="flex flex-col gap-4 text-center">
          <h1 className="text-h3">And how are you doing?</h1>
          <p className="text-body text-navy-60">
            You&rsquo;ve been holding someone else&rsquo;s hardest months. That takes something out
            of you too.
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" onClick={() => setPhase('renew')}>
              I&rsquo;m doing okay
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                // Wrap up flows deliberately never use pause language (this
                // is the global "not taking new" switch, not a step-away
                // from any one conversation — that action lives on a live
                // thread, and this relationship just ended). Any other
                // conversations she's already in keep going untouched.
                setPalAvailability('not_taking_new')
                navigate('/pal/home')
              }}
            >
              That was heavy — hold new requests for now
            </Button>
          </div>
          <p className="text-label text-navy-60">
            Takes effect straight away, and any other conversations you&rsquo;re in keep going. Your
            care team is there for you as well.
          </p>
        </motion.div>
      )}

      {phase === 'renew' && (
        <motion.div {...fade} className="flex flex-col gap-4 text-center">
          <h1 className="text-h3">Would you do this again?</h1>
          <p className="text-body text-navy-60">
            Another member is going through what you went through. No pressure either way — this is
            a good moment to choose, not an obligation.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              onClick={() => {
                setPalAvailability('available')
                navigate('/pal/home')
              }}
            >
              Yes, match me with someone
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setPalAvailability('not_taking_new')
                navigate('/pal/home')
              }}
            >
              Not for now
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
