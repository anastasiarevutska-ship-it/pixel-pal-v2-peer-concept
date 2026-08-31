import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Tag } from '../../components/ui/Tag'
import { Button } from '../../components/ui/Button'
import { Toast } from '../../components/ui/Toast'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { useDemoStore } from '../../store/useDemoStore'
import { treatmentLabels } from '../../lib/treatmentLabels'
import { palImpactSummary } from '../../lib/palImpact'
import type { Availability, Person, Relationship } from '../../lib/types'

// `graduated` reads as "Graduated" here rather than "Wrapped up" — the
// section header below already says "Wrapped up" for the whole group, so
// the per-row label's job is to say *which kind* of wrapped-up this one is
// (naturally completed vs. simply ended), not repeat the section name.
// `archived` stays the deliberately neutral "Ended" either way — it must
// never say why or who ended it (see `ConversationRow` below).
const conversationStateLabel: Partial<Record<Relationship['state'], string>> = {
  quiet: 'Quiet for a while',
  paused: 'Paused',
  graduated: 'Graduated',
  archived: 'Ended',
}

// Same stroke-icon convention as `ScreenHeader`'s back chevron (viewBox 24,
// strokeWidth 2, round caps/joins) — not a new icon language for one button.
function PencilIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-navy"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

/**
 * P8 · Pal home (workshop §6.5 step 3) — the surface that does not exist
 * today at all. A Pal currently has no home: no status, no controls, no
 * sense of whether she is active, idle, or effectively shelved.
 *
 * Reached as a drill-down from the "Pal Home" card on `/pal/messages`, not
 * as a landing screen — her real landing surfaces are `/pal/dashboard`
 * (Home tab) and `/pal/messages` (Messages tab). So this carries the plain
 * back-button + screen-title header (`ScreenHeader`) that pattern's own
 * sub-pages use, not the glow/greeting/`TabBar` chrome those two tab
 * screens have — no tab bar here, matching every one of those source
 * screens. `PalRequestReminderCard` moved to `/pal/dashboard` for the same
 * reason: it belongs on the screen she actually lands on, not buried a
 * level down.
 *
 * Deliberately narrow: this screen's job is requests, ongoing
 * conversations, and impact — each answers a specific finding from §2.2G.
 * "My Pal Profile" here is a read-only preview — her photo, name, status,
 * treatment tags — not the editor. Her story text (About, What helped her,
 * What she can offer) stays edit-only, on `PalEdit`, reached through the
 * pencil icon inside the card, rather than echoed here too. Folding all of that
 * inline here (an earlier version did) made the home screen read as a
 * settings page with a queue attached, rather than the other way around —
 * a preview card keeps "this is who you are as a Pal" visible without
 * turning Home into the form itself.
 *
 * The 14-day-idle auto-switch to "not taking new" is surfaced here too,
 * because it's urgent, not a setting. When it fires it must read as care,
 * not punishment — "we turned off new requests while you were away" —
 * because the failure it prevents (a member matched into silence) is the
 * worst outcome this feature can produce, and the Pal did nothing wrong.
 * It's still just the global availability switch, though: nothing about her
 * existing conversations changes, and it never uses pause language, which
 * means something narrower and Pal-initiated (see PalChat's "Pause this
 * conversation").
 */
export default function PalHome() {
  const navigate = useNavigate()
  const palId = useDemoStore((s) => s.palFlow.palId)
  const profile = useDemoStore((s) => s.palProfiles[palId])
  const relationships = useDemoStore((s) => s.relationships)
  const people = useDemoStore((s) => s.people)
  const setPalAvailability = useDemoStore((s) => s.setPalAvailability)

  const [toast, setToast] = useState('')

  if (!profile) return <Navigate to="/pal/about" replace />

  const person = people[palId]
  const mine = Object.values(relationships).filter((r) => r.palId === palId)
  const incoming = mine.filter((r) => r.state === 'pending')
  // Paused counts as ongoing, not past — it's still a live relationship
  // (still holding her capacity slot), just inactive for now. Filing it
  // under "past" alongside graduated/archived would read as ended, which is
  // exactly what pausing isn't, and would undercount "Supporting N of
  // capacity" below against what `activeCount` actually reflects.
  const ongoing = mine.filter((r) => r.state === 'active' || r.state === 'quiet' || r.state === 'paused')
  const past = mine.filter((r) => ['graduated', 'archived'].includes(r.state))

  // Shared with `PalGraduationMoment`'s closure screen — same computation,
  // one function, so the two surfaces describing "you've now been there
  // for N people" can never quietly disagree (see `palImpact.ts`).
  const { supported, messagesSent, highlighted } = palImpactSummary(relationships, palId)

  const autoNotTakingNew = !!profile.autoNotTakingNewAt && profile.availability === 'not_taking_new'

  function flashToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(''), 2200)
  }

  function handleAvailability(next: Availability) {
    setPalAvailability(next)
    flashToast(next === 'available' ? 'You’re available again.' : 'No new requests for now.')
  }

  return (
    <div className="relative flex min-h-full flex-col gap-6 p-5 pb-8">
      <ScreenHeader title="Pal Home" onBack={() => navigate('/pal/messages')} />

      <div className="flex flex-col gap-5">
        {autoNotTakingNew && (
          <div className="rounded-card bg-yellow-40 p-4">
            <p className="text-body-sm-bold text-navy">We turned off new requests while you were away</p>
            <p className="mt-1 text-body-sm text-navy-80">
              You hadn&rsquo;t been here in a couple of weeks, so we stopped sending you new requests
              rather than leaving someone waiting. Turn it back on whenever you&rsquo;re ready.
            </p>
            <div className="mt-3">
              <Button variant="secondary" fullWidth={false} onClick={() => handleAvailability('available')}>
                I&rsquo;m back
              </Button>
            </div>
          </div>
        )}

        {/* My Pal Profile — a read-only preview of who she is as a Pal:
            photo, name, treatment tags. Editing any of it — her story
            text, capacity, reply time, availability — happens on one
            dedicated screen (`PalEdit`), reached via the pencil icon in the
            card's corner, not inline — see the docblock above. Bare label
            above it, same as "Your conversations" / "Your impact" below —
            the action moved into the card, so this row no longer needs one
            of its own. Status/capacity/reply-time details were dropped from
            this preview — they read as clutter here; she can already see
            and change all of them on `PalEdit`. */}
        <div className="flex flex-col gap-2">
          <p className="text-label-bold uppercase text-navy-60">My Pal Profile</p>

          <Card variant="standard" className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar name={person?.displayName ?? ''} src={person?.avatarUrl} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-body-bold">{person?.displayName}</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/pal/edit')}
                aria-label="Edit your Pal profile"
                className="flex h-11 w-11 shrink-0 items-center justify-center"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-icon bg-lavender-40">
                  <PencilIcon />
                </span>
              </button>
            </div>

            {profile.experience.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.experience.map((code) => (
                  <Tag key={code}>{treatmentLabels[code]?.acronym ?? treatmentLabels[code]?.label ?? code}</Tag>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Incoming requests */}
        {incoming.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-label-bold uppercase text-navy-60">
              {incoming.length === 1 ? 'Someone has reached out' : `${incoming.length} people have reached out`}
            </p>
            {incoming.map((r) => {
              const member = people[r.memberId]
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => navigate(`/pal/request/${r.id}`)}
                  className="flex items-center gap-3 rounded-card bg-lavender-20 p-4 text-left transition-colors hover:bg-lavender-40"
                >
                  <Avatar name={member?.displayName ?? ''} src={member?.avatarUrl} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm-bold text-navy">{member?.displayName}</p>
                    <p className="truncate text-label text-navy-60">{r.introNote}</p>
                  </div>
                  <span aria-hidden="true" className="text-body-bold text-navy">
                    →
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Active / Wrapped up — split so a natural graduation and a
            connection that simply ended don't sit in one undifferentiated
            list, without turning "ended" into two competing sections of
            its own (see `ConversationRow` below for how one row tells the
            two apart without ever exposing *why* an ended one ended). */}
        {ongoing.length === 0 && past.length === 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-label-bold uppercase text-navy-60">Your conversations</p>
            <Card variant="standard">
              <p className="text-body-sm text-navy-60">
                Nothing yet. When a member reaches out, her note will land here first.
              </p>
            </Card>
          </div>
        ) : (
          <>
            {ongoing.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-label-bold uppercase text-navy-60">Active</p>
                {ongoing.map((r) => (
                  <ConversationRow key={r.id} relationship={r} palId={palId} member={people[r.memberId]} />
                ))}
              </div>
            )}
            {past.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-label-bold uppercase text-navy-60">Wrapped up</p>
                {past.map((r) => (
                  <ConversationRow key={r.id} relationship={r} palId={palId} member={people[r.memberId]} />
                ))}
              </div>
            )}
          </>
        )}

        {/*
          Your Impact — quiet private reflection, not a dashboard, a
          leaderboard, or a reward system. The point isn't "you sent N
          messages"; it's "you were there while someone went through
          something, and that mattered." Three levels, most to least
          prominent: a thank-you excerpt (when one exists) is the emotional
          highlight and leads; people supported comes next as the quiet
          aggregate; message count is the least important of the three —
          supporting context, never equal weight to people supported. No
          streaks, badges, "Top Pal" labels, or comparisons. If several
          thank-you notes exist, only the most recent shows here — this
          never becomes a feed.
        */}
        <Card variant="standard" className="flex flex-col gap-1">
          <p className="text-label-bold uppercase text-navy-60">Your impact</p>

          {supported === 0 ? (
            <p className="text-body-sm text-navy-60">
              This is where you&rsquo;ll see the difference your support has made — once
              you&rsquo;ve been there for someone.
            </p>
          ) : highlighted ? (
            <>
              <p className="mt-1 text-body-sm-bold text-navy">
                {people[highlighted.memberId]?.displayName} wanted you to know
              </p>
              <p className="text-body text-navy-80">&ldquo;{highlighted.thankYouNote}&rdquo;</p>
              <p className="mt-2 text-label text-navy-60">
                You&rsquo;ve been there for {supported} {supported === 1 ? 'person' : 'people'}{' '}
                through treatment.
              </p>
              <p className="text-label text-navy-60">
                {messagesSent} {messagesSent === 1 ? 'message' : 'messages'} shared along the way ·
                Only you see this
              </p>
            </>
          ) : (
            <>
              <p className="text-body text-navy-80">
                You&rsquo;ve been there for {supported} {supported === 1 ? 'person' : 'people'} through
                treatment.
              </p>
              <p className="text-label text-navy-60">
                {messagesSent} {messagesSent === 1 ? 'message' : 'messages'} shared along the way ·
                Only you see this
              </p>
            </>
          )}
        </Card>
      </div>

      <Toast message={toast} isOpen={!!toast} />
    </div>
  )
}

/**
 * One row, shared by both Active and Wrapped up — the state on the
 * relationship itself decides everything about how it looks and where it
 * goes, so the two sections can never quietly drift into different rules.
 *
 * The "New" pill and the graduation-screen destination both come from the
 * same fact (`graduationSeenAt`) as Pal Home's Home-tab card and
 * `PalGraduationMoment` itself — one unread/read state, not several. Same
 * yellow the TabBar's Messages dot already uses for "something of yours to
 * look at" (as opposed to `coral`, which the codebase reserves for the
 * Requester-side unseen-outcome signal) — this is that same kind of event,
 * just surfaced here instead of the tab bar.
 *
 * An `archived` row never gets a pill or a different destination here —
 * same tap target, same neutral "Ended" label, on purpose: nothing about
 * *why* it ended is this row's business (spec: never expose who ended it
 * or why, and never label it as reported).
 */
function ConversationRow({
  relationship,
  palId,
  member,
}: {
  relationship: Relationship
  palId: string
  member: Person | undefined
}) {
  const navigate = useNavigate()
  const last = relationship.messages[relationship.messages.length - 1]
  // "Waiting on you" only ever applies to a live thread — never to a
  // wrapped-up one, graduated or otherwise.
  const waitingOnMe =
    !!last && last.senderId !== palId && (relationship.state === 'active' || relationship.state === 'quiet')
  const unread = relationship.state === 'graduated' && !relationship.graduationSeenAt
  const to = unread ? `/pal/graduation/${relationship.id}` : `/pal/chat/${relationship.id}`

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="flex items-center gap-3 rounded-card bg-white p-4 text-left shadow-card"
    >
      <Avatar name={member?.displayName ?? ''} src={member?.avatarUrl} size="md" />
      <div className="min-w-0 flex-1">
        <p className="text-body-sm-bold text-navy">{member?.displayName}</p>
        <p className="truncate text-label text-navy-60">
          {conversationStateLabel[relationship.state] ?? last?.body ?? ''}
        </p>
      </div>
      {waitingOnMe && (
        <span className="shrink-0 rounded-pill bg-lavender-40 px-3 py-1 text-label-bold text-navy">
          Your turn
        </span>
      )}
      {unread && (
        <span className="shrink-0 rounded-pill bg-yellow-40 px-3 py-1 text-label-bold text-navy">New</span>
      )}
    </button>
  )
}
