import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { useDemoStore } from '../../store/useDemoStore'

/**
 * M9 · Graduate [KEY MOMENT] (spec §7). A closing moment — thank-you
 * passed to the Pal, then the pass-it-forward ask. This is one of the
 * three moments spec §0 says every trade-off must protect.
 */
export default function Graduate() {
  const { relationshipId = '' } = useParams()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const relationship = useDemoStore((s) => s.relationships[relationshipId])
  const pal = useDemoStore((s) => s.people[relationship?.palId ?? ''])
  const graduateRelationship = useDemoStore((s) => s.graduateRelationship)

  const [phase, setPhase] = useState<'thankyou' | 'ask'>('thankyou')

  useEffect(() => {
    if (relationship && relationship.state !== 'graduated') {
      graduateRelationship(relationship.id)
    }
  }, [relationship, graduateRelationship])

  if (!relationship || !pal) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <p className="text-body text-navy-60">Conversation not found.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
      {phase === 'thankyou' ? (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <Avatar name={pal.displayName} src={pal.avatarUrl} size="xl" />
          <p className="text-label-bold text-lavender uppercase">Graduated</p>
          <h2 className="text-h3">Your thank-you has been passed to {pal.displayName}</h2>
          <p className="text-body text-navy-60">
            She&rsquo;ll see how much this meant to you. Nothing about this conversation is lost — it stays here
            whenever you want to look back.
          </p>
          <Button variant="primary" fullWidth={false} onClick={() => setPhase('ask')}>
            Continue
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <h2 className="text-h3">{pal.displayName} was there for you.</h2>
          <p className="text-body text-navy-60">Would you do that for someone else?</p>
          <Button variant="primary" fullWidth={false} onClick={() => navigate('/pal')}>
            Become a Pal
          </Button>
          <button
            type="button"
            onClick={() => navigate('/m')}
            className="text-body-sm text-navy-60 underline-offset-4 hover:underline"
          >
            Not right now
          </button>
        </motion.div>
      )}
    </div>
  )
}
