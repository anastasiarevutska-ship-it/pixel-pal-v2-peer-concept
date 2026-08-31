import { useNavigate } from 'react-router-dom'
import { Button } from './ui/Button'
import { useDemoStore } from '../store/useDemoStore'

function PersonHeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-navy">
      <path d="M17.841 15.659L18.017 15.836L18.1945 15.659C19.0732 14.7803 20.4978 14.7803 21.3765 15.659C22.2552 16.5377 22.2552 17.9623 21.3765 18.841L18.0178 22.1997L14.659 18.841C13.7803 17.9623 13.7803 16.5377 14.659 15.659C15.5377 14.7803 16.9623 14.7803 17.841 15.659ZM12 14V22H4C4 17.6651 7.44784 14.1355 11.7508 14.0038L12 14ZM12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1Z" />
    </svg>
  )
}

/**
 * The Pal-side Pixel Pal card on her main Home — one card, two things it
 * can be showing, never both at once: an unread graduation closure moment
 * (see `PalGraduationMoment`) takes priority over "someone's waiting on
 * you" (a pending request). Closure before a new ask, on purpose — a
 * pending request is still fully reachable in the meantime from the rows
 * on Pal Home, but this one card only gets to say one thing, and a Pal who
 * just found out someone graduated shouldn't have that quietly buried
 * under the next request in line. Styled as a peer of Home's real event
 * cards (Lab Test, Delivery) rather than the lavender "something
 * available" treatment the member's discovery card uses — same
 * `bg-lavender-20`/`card-title` language `PixelPalReminderCard` already
 * uses, just first in the feed instead of last (see `PatientDashboard`'s
 * `reminderFirst`).
 *
 * Both branches share the same "no dismissal, no cadence" philosophy, for
 * the same reason: `PixelPalReminderCard` invites a member to discover a
 * feature she hasn't used, so it earns the right to be dismissed and
 * rate-limited. Neither of these is that — a request already reached out
 * and is waiting on a reply she doesn't know is overdue, and a graduation
 * already happened and is waiting to be acknowledged. Both only go away
 * the honest way: she responds, or she opens the graduation screen
 * (`acknowledgeGraduation`) — never by dismissing.
 *
 * It renders alongside (not instead of) the per-request/per-conversation
 * rows on Pal Home — this is the loud, unmissable banner on the screen she
 * actually opens first; that list is still the actionable inbox/history
 * once she's ready to look.
 */
export function PalRequestReminderCard() {
  const navigate = useNavigate()

  const palId = useDemoStore((s) => s.palFlow.palId)
  const relationships = useDemoStore((s) => s.relationships)
  const people = useDemoStore((s) => s.people)

  const pending = Object.values(relationships)
    .filter((r) => r.palId === palId && r.state === 'pending')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const unreadGraduation = Object.values(relationships)
    .filter((r) => r.palId === palId && r.state === 'graduated' && !r.graduationSeenAt)
    .sort((a, b) => (a.lastMessageAt ?? a.createdAt).localeCompare(b.lastMessageAt ?? b.createdAt))[0]

  if (pending.length === 0 && !unreadGraduation) return null

  return (
    <div className="flex flex-col gap-6 rounded-card bg-lavender-20 p-3">
      <div className="flex items-center gap-4">
        <div className="flex shrink-0 items-center justify-center rounded-icon bg-lavender-40 p-2">
          <PersonHeartIcon />
        </div>
        <p className="flex-1 text-card-title text-navy">Pixel Pal</p>
      </div>

      {unreadGraduation ? (
        <GraduationUpdate
          memberName={people[unreadGraduation.memberId]?.displayName ?? 'Someone'}
          hasNote={!!unreadGraduation.thankYouNote}
          onOpen={() => navigate(`/pal/graduation/${unreadGraduation.id}`)}
        />
      ) : (
        <RequestWaiting
          count={pending.length}
          oldestName={people[pending[0].memberId]?.displayName ?? 'Someone'}
          onRespond={() => navigate(`/pal/request/${pending[0].id}`)}
        />
      )}
    </div>
  )
}

function RequestWaiting({
  count,
  oldestName,
  onRespond,
}: {
  count: number
  oldestName: string
  onRespond: () => void
}) {
  const heading = count === 1 ? `${oldestName} is waiting on you` : `${count} people are waiting on you`
  return (
    <>
      <div className="flex flex-col gap-1.5 text-navy-80">
        <p className="text-body-bold">{heading}</p>
        <p className="text-body">
          {count === 1
            ? 'She reached out and hasn’t heard back yet.'
            : 'They reached out and haven’t heard back yet.'}
        </p>
      </div>

      {/* Neutral verb, not "Say hello" — this opens the request screen where
          she can just as easily decline (§5 A3), and with more than one
          pending, naming only the oldest here would undersell both the
          count above and that choice. */}
      <Button variant="secondary" className="border border-lavender" onClick={onRespond}>
        {count === 1 ? 'Review request' : 'Review requests'}
      </Button>
    </>
  )
}

function GraduationUpdate({
  memberName,
  hasNote,
  onOpen,
}: {
  memberName: string
  hasNote: boolean
  onOpen: () => void
}) {
  return (
    <>
      <div className="flex flex-col gap-1.5 text-navy-80">
        <p className="text-body-bold">{memberName} wrapped up your conversation</p>
        {hasNote && <p className="text-body">She left you a note.</p>}
      </div>
      <Button variant="secondary" className="border border-lavender" onClick={onOpen}>
        {hasNote ? 'See her note' : 'View update'}
      </Button>
    </>
  )
}
