import { Link, useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/ui/EmptyState'
import { useDemoStore } from '../../store/useDemoStore'

const stateLabel: Record<string, string> = {
  archived: 'Archived',
  graduated: 'Graduated',
}

/** Nothing is ever deleted (spec §7/§10) — archived and graduated
 * conversations stay reachable here, never gone. A paused one is
 * deliberately excluded: it's still a live relationship, just inactive for
 * now, and belongs with the ongoing threads on the Messages/Contacts entry
 * (`useOngoingPalEntry`), not filed under "past" — that would read as ended,
 * which is exactly what pausing isn't. */
export default function PastConversations() {
  const navigate = useNavigate()
  const memberId = useDemoStore((s) => s.currentMemberId)
  const relationships = useDemoStore((s) => s.relationships)
  const people = useDemoStore((s) => s.people)

  const past = Object.values(relationships)
    .filter(
      (r) =>
        r.memberId === memberId &&
        r.state !== 'active' &&
        r.state !== 'pending' &&
        r.state !== 'quiet' &&
        r.state !== 'paused',
    )
    .sort((a, b) => (b.lastMessageAt ?? b.createdAt).localeCompare(a.lastMessageAt ?? a.createdAt))

  return (
    <div className="flex h-full flex-col gap-4 p-5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/m')}
          aria-label="Back"
          className="flex h-11 w-11 items-center justify-center text-h4 text-navy"
        >
          ←
        </button>
        <h2 className="text-h3">Past conversations</h2>
      </div>

      {past.length === 0 ? (
        <EmptyState title="Nothing here yet" description="Conversations that end stay here, never deleted." />
      ) : (
        <div className="flex flex-col gap-2">
          {past.map((r) => {
            const pal = people[r.palId]
            if (!pal) return null
            return (
              <Link key={r.id} to={`/m/chat/${r.id}`}>
                <Card variant="standard" className="flex items-center gap-3">
                  <Avatar name={pal.displayName} src={pal.avatarUrl} size="sm" />
                  <div className="flex-1">
                    <p className="text-body-sm-bold">{pal.displayName}</p>
                    <p className="text-label text-navy-60">{stateLabel[r.state] ?? r.state}</p>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
