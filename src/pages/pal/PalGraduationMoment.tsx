import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useDemoStore } from '../../store/useDemoStore'

/**
 * The Pal-side closure moment for a *Requester*-initiated graduation — the
 * one-time answer to "did being there actually matter?" for the case where
 * she wasn't watching it happen live.
 *
 * Deliberately not the same screen as `PalGraduate` (P11, "Wrap up
 * together"): that flow is Pal-initiated, three beats long, and asks her
 * wellbeing and whether she'd do this again — right, because she's mid-
 * decision there. Here the decision already happened on the other end; she
 * is only ever being told, warmly, once. No wellbeing check, no renewal
 * ask — asking her to take another person from a closure screen would turn
 * "thank you" into a pitch (see the brief this was built from).
 *
 * Reached two ways — Pal Home's "Wrapped up" row and the Pixel Pal card on
 * her main Home — both pointing at the same relationship id, so there is
 * exactly one screen and one read/unread fact (`graduationSeenAt`) behind
 * both entry points, not two notification states that could disagree.
 *
 * This screen does not itself graduate anything — unlike `PalGraduate`,
 * which drives that transition, the relationship is already `graduated` by
 * the time she can reach this route (either the real member-side Graduate
 * flow already ran, or a demo control simulated it). Its only job is to
 * mark the moment seen and present it.
 */
export default function PalGraduationMoment() {
  const { relationshipId = '' } = useParams()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const palId = useDemoStore((s) => s.palFlow.palId)
  const relationship = useDemoStore((s) => s.relationships[relationshipId])
  const member = useDemoStore((s) => s.people[relationship?.memberId ?? ''])
  const acknowledgeGraduation = useDemoStore((s) => s.acknowledgeGraduation)

  useEffect(() => {
    if (relationship && relationship.state === 'graduated' && !relationship.graduationSeenAt) {
      acknowledgeGraduation(relationship.id)
    }
  }, [relationship, acknowledgeGraduation])

  if (!relationship || !member || relationship.palId !== palId || relationship.state !== 'graduated') {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <p className="text-body text-navy-60">Nothing to show here right now.</p>
      </div>
    )
  }

  const thankYouNote = relationship.thankYouNote

  return (
    <div className="flex min-h-full flex-col justify-center gap-6 p-6">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 text-center"
      >
        <p className="text-label-bold uppercase text-lavender">Wrapped up</p>
        <h1 className="text-h3">{member.displayName} has wrapped up your conversation</h1>

        {/* One or the other, never both, and never a tally — Impact's
            aggregate numbers (people supported, messages sent) live on Pal
            Home, not here. A note is the warmer, more specific closing when
            there is one; the plain line is what she gets when there isn't,
            not an empty space where the note would have been. */}
        {thankYouNote ? (
          <Card variant="standard" className="text-left">
            <p className="text-label-bold uppercase text-navy-60">A note from {member.displayName}</p>
            <p className="mt-2 text-body text-navy-80">&ldquo;{thankYouNote}&rdquo;</p>
          </Card>
        ) : (
          <p className="text-body-sm text-navy-80">You showed up when it mattered.</p>
        )}

        <Button variant="primary" onClick={() => navigate('/pal/home')}>
          Back to Pal Home
        </Button>
      </motion.div>
    </div>
  )
}
