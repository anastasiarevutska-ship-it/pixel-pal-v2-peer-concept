import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Tag } from '../../components/ui/Tag'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { EmptyState } from '../../components/ui/EmptyState'
import { Toast } from '../../components/ui/Toast'
import { useDemoStore } from '../../store/useDemoStore'
import { formatTreatments, treatmentLabels } from '../../lib/treatmentLabels'
import { lowerFirst, replyTimeframeLabel } from '../../lib/replyTimeframes'
import { aboutMeOrFallback } from '../../lib/palDisplay'
import { palHistoryFor } from '../../lib/palHistory'
import type { Availability } from '../../lib/types'

// Suggestion cards only ever show Pals `rankAllPals` already filtered to
// `available` (see rankPals.ts's hasHeadroom), so this reads "Available" in
// practice every time — but deriving it honestly from her actual status,
// same as everywhere else status is shown, is one line and means this
// stays correct if that ever changes (e.g. a future fallback view).
function availabilityLabel(availability: Availability): string {
  if (availability === 'not_taking_new') return 'Not taking new'
  return 'Available'
}

/**
 * M4 · Your suggestions [KEY MOMENT] (spec §7). ~1.2s warm loading pause
 * (deliberate pacing, not a real fetch), then up to 3 cards each with a
 * required reason. Thin-supply and zero-result fallbacks are never a dead
 * end — there's always at least a "Notify me" action (spec §11.7).
 *
 * Pals who don't share her treatment are never mixed into the list to pad
 * it out (see `splitByTreatmentMatch`). They're offered as an explicit
 * second look, after she's been told plainly that nobody available has been
 * through what she has — and the list stays labelled as such once she takes
 * it, because "she knows this road" is a smaller claim than "she's been
 * through your treatment" and shouldn't quietly borrow its credibility.
 */
export default function Suggestions() {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const memberId = useDemoStore((s) => s.currentMemberId)
  const shortlist = useDemoStore((s) => s.memberFlow.shortlist)
  const suggestionsExhausted = useDemoStore((s) => s.memberFlow.suggestionsExhausted)
  const broaderCount = useDemoStore((s) => s.memberFlow.broaderPool.length)
  const broadened = useDemoStore((s) => s.memberFlow.broadened)
  const showBroaderPals = useDemoStore((s) => s.showBroaderPals)
  const draftTreatments = useDemoStore((s) => s.memberFlow.draftTreatments)
  const palProfiles = useDemoStore((s) => s.palProfiles)
  const people = useDemoStore((s) => s.people)
  const relationships = useDemoStore((s) => s.relationships)
  const declineSuggestion = useDemoStore((s) => s.declineSuggestion)
  const chooseSuggestion = useDemoStore((s) => s.chooseSuggestion)
  const restartSuggestions = useDemoStore((s) => s.restartSuggestions)
  const lastOutcome = useDemoStore((s) => s.memberFlow.lastOutcome)
  const acknowledgeOutcome = useDemoStore((s) => s.acknowledgeOutcome)
  // Her treatment, surfaced passively — never asked cold (spec §7's own
  // "prefilled from record" intent, taken further per direct feedback).
  const treatmentPhrase = formatTreatments(draftTreatments)

  const [revealed, setRevealed] = useState(false)
  const [profilePalId, setProfilePalId] = useState<string | null>(null)
  const [notifyToast, setNotifyToast] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 1200)
    return () => clearTimeout(t)
  }, [])

  // She's reached the screen that actually explains a decline — a fresh,
  // backfilled shortlist with "Here are your other suggestions" already the
  // premise of being here. Clears the Messages-tab dot and the Pixel Pal
  // card's outcome copy, same guard Chat.tsx uses for the accepted case:
  // only a *declined* outcome is ever explained by landing here, so an
  // unseen accepted outcome (which routes to Chat, not here) is left alone.
  useEffect(() => {
    if (lastOutcome?.type === 'declined' && !lastOutcome.seenAt) acknowledgeOutcome()
  }, [lastOutcome, acknowledgeOutcome])

  const visible = shortlist.filter((s) => s.state === 'offered' || s.state === 'chosen')

  // "You've met before", per visible Pal. Derived here rather than carried
  // on `Suggestion` — the fact already lives in `relationships`, and most of
  // these lookups return null (a shortlist is usually all strangers).
  const history = Object.fromEntries(
    visible.map((s) => [s.palId, palHistoryFor(relationships, memberId, s.palId)]),
  )

  function handleChoose(palId: string) {
    chooseSuggestion(palId)
    navigate('/m/say-hello')
  }

  function handleNotify() {
    setNotifyToast(true)
    setTimeout(() => setNotifyToast(false), 2000)
  }

  function handleRestart() {
    restartSuggestions(memberId)
  }

  if (!revealed) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div
          className="h-10 w-10 animate-spin rounded-pill border-2 border-lavender border-t-transparent"
          aria-hidden="true"
        />
        <p className="text-body text-navy-60">Finding people who&rsquo;ve been where you are&hellip;</p>
      </div>
    )
  }

  const profilePerson = profilePalId ? people[profilePalId] : undefined
  const profilePal = profilePalId ? palProfiles[profilePalId] : undefined

  return (
    <div className="relative flex flex-col gap-4 p-5">
      {/* Header stays put regardless of whether there's anyone to show
          below it — an empty result is still an answer to "your
          suggestions", not a different screen. */}
      <div>
        <p className="text-label-bold text-lavender uppercase">Pixel Pal</p>
        <h2 className="text-h3">Your suggestions</h2>
        <p className="mt-1 text-body-sm text-navy-60">
          {broadened
            ? "People who know this road, even though their treatment was different."
            : treatmentPhrase
              ? `People who've been where you are with ${treatmentPhrase}, matched to what would help.`
              : "People who've been where you are, matched to what would help."}
        </p>
      </div>

      {visible.length === 0 ? (
        // Three different empty results, because they're three different
        // situations and the way out of each one is different. What decides
        // it is whether there's anywhere to actually go: `broaderCount` is
        // available Pals with different experience, so a "See other Pals"
        // button only appears where it opens a real list rather than
        // re-running a match that already came back empty.
        suggestionsExhausted ? (
          broaderCount > 0 ? (
            // She's said "Not for me" to everyone who shares her treatment,
            // but Pals with other experience are still there — offer those
            // rather than only handing the same list back.
            <EmptyState
              title="That's everyone who's been through the same as you"
              description="There are other Pals available. Their treatment was different, but they know this road."
              action={
                <div className="flex w-full flex-col gap-2">
                  <Button variant="primary" onClick={showBroaderPals}>
                    See other Pals
                  </Button>
                  <Button variant="ghost" onClick={handleRestart}>
                    Show me these again
                  </Button>
                </div>
              }
            />
          ) : (
            // Nothing left in either group. The Pals she declined are still
            // available, so re-running the match genuinely brings the list
            // back — this is where a refresh button is honest.
            <EmptyState
              title="That's everyone we found for now"
              description="None of these felt right? We can take another look, or let you know when someone new joins."
              action={
                <div className="flex w-full flex-col gap-2">
                  <Button variant="primary" onClick={handleRestart}>
                    Show me these again
                  </Button>
                  <Button variant="ghost" onClick={handleNotify}>
                    Notify me when someone new joins
                  </Button>
                </div>
              }
            />
          )
        ) : broaderCount > 0 ? (
          // Nobody available has been through her treatment. Said plainly,
          // before offering the alternative — the broader list is a real
          // option, but presenting those Pals as matches for what she asked
          // about would be a lie, so she gets told and then chooses.
          <EmptyState
            title={
              treatmentPhrase
                ? `No one available has been through ${treatmentPhrase}`
                : 'No one available has been through the same treatment'
            }
            description="There are other Pals here. Their treatment was different, but they know this road — or we can wait and tell you when someone new joins."
            action={
              <div className="flex w-full flex-col gap-2">
                <Button variant="primary" onClick={showBroaderPals}>
                  See other Pals
                </Button>
                <Button variant="ghost" onClick={handleNotify}>
                  Notify me instead
                </Button>
              </div>
            }
          />
        ) : (
          // Nobody at all is available — not even a different-treatment
          // fallback. Nothing to offer but the informed wait state (spec
          // §11.7): what happens next, who's doing it, somewhere to go
          // meanwhile.
          <EmptyState
            title="No suggestions for you right now"
            description="A coordinator is personally looking for your match. We'll notify you the moment someone becomes available."
            action={
              <div className="flex w-full flex-col gap-2">
                <Button variant="primary" onClick={handleNotify}>
                  Notify me
                </Button>
                <Button variant="ghost" onClick={() => navigate('/m/how-it-works')}>
                  How Pixel Pal works
                </Button>
              </div>
            }
          />
        )
      ) : (
        <>
          {/* Why this list isn't what she asked for: said once, in the
              subtitle above ("People who know this road, even though their
              treatment was different.") — not repeated here too. She just
              came from an empty state that told her the same thing before
              she chose to look; a second banner restating it while she's
              reading their stories reads as nagging, not helpful. */}
          {!broadened && visible.length < 3 && (
            <div className="flex items-center justify-between gap-3 rounded-field bg-yellow-40 px-3 py-2">
              <p className="text-body-sm text-navy-80">
                We found {visible.length === 1 ? 'one person who is a close match' : `${visible.length} people who are close matches`}.
                More Pals join every week.
              </p>
              <Button variant="ghost" fullWidth={false} onClick={handleNotify}>
                Notify me
              </Button>
            </div>
          )}

          <AnimatePresence initial={false}>
            {visible.map((s) => {
              const person = people[s.palId]
              const profile = palProfiles[s.palId]
              if (!person || !profile) return null
              return (
                <motion.div
                  key={s.palId}
                  layout
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, x: -24 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <Card variant="standard" className="flex flex-col gap-4">
                    {/* Photo, bigger — the point is a real person to feel a
                        connection to, not a small icon next to her name. */}
                    <div className="flex items-center gap-4">
                      <Avatar name={person.displayName} src={person.avatarUrl} size="xl" />
                      <p className="flex-1 text-h3">{person.displayName}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="inline-flex w-fit items-center rounded-field bg-lavender-40 px-3 py-1.5 text-body-sm-bold text-navy">
                        {s.reason}
                      </div>
                      {/* Deliberately quieter than the reason above it: the
                          lavender pill is why we're recommending her, this
                          is only a "you two have met." Styling it the same
                          would read as a second endorsement — and for the
                          case this exists for (she walked away from this
                          Pal), overselling is exactly wrong. It sits under
                          the reason rather than beside her name so it can't
                          be mistaken for part of her identity. */}
                      {history[s.palId] && (
                        <p className="inline-flex w-fit items-center gap-1.5 rounded-field bg-gray20 px-3 py-1.5 text-label-bold text-navy-60">
                          <span aria-hidden="true">↩</span>
                          {history[s.palId]!.label}
                        </p>
                      )}
                    </div>

                    {/* About me — the card's one prose block. `whereIWas` /
                        `whatHelpedMe` / `whatICanOffer` stay in "See full
                        profile" below rather than repeating similar ground
                        here in a different phrasing. */}
                    <p className="text-body-sm text-navy-80">{aboutMeOrFallback(profile.story)}</p>

                    <div className="flex flex-wrap gap-2">
                      {profile.experience.map((code) => (
                        <Tag key={code}>{treatmentLabels[code]?.acronym ?? treatmentLabels[code]?.label ?? code}</Tag>
                      ))}
                    </div>

                    <p className="flex items-center gap-1.5 text-label text-navy-60">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-pill bg-lavender" aria-hidden="true" />
                      {availabilityLabel(profile.availability)} · Usually replies{' '}
                      {lowerFirst(replyTimeframeLabel(profile.typicalReplyHours))}
                    </p>

                    <Button variant="primary" onClick={() => handleChoose(s.palId)}>
                      Choose her
                    </Button>
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" fullWidth={false} onClick={() => setProfilePalId(s.palId)}>
                        See full profile
                      </Button>
                      <Button variant="ghost" fullWidth={false} onClick={() => declineSuggestion(s.palId)}>
                        Not for me
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </>
      )}

      <Sheet isOpen={!!profilePalId} onClose={() => setProfilePalId(null)} title={profilePerson?.displayName}>
        {profilePal && (
          <div className="flex flex-col gap-4">
            {/* The card only had room for the label; the sheet is where
                "you talked before" can say what that actually means for
                her — including that the old conversation still exists. */}
            {profilePalId && history[profilePalId] && (
              <p className="rounded-field bg-gray20 px-3 py-2 text-body-sm text-navy-80">
                {history[profilePalId]!.detail}
              </p>
            )}
            <div>
              <p className="text-label-bold text-navy-60">WHERE SHE WAS</p>
              <p className="text-body text-navy-80">{profilePal.story.whereIWas}</p>
            </div>
            <div>
              <p className="text-label-bold text-navy-60">WHAT HELPED HER</p>
              <p className="text-body text-navy-80">{profilePal.story.whatHelpedMe}</p>
            </div>
            <div>
              <p className="text-label-bold text-navy-60">WHAT SHE CAN OFFER</p>
              <p className="text-body text-navy-80">{profilePal.story.whatICanOffer}</p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                if (profilePalId) handleChoose(profilePalId)
                setProfilePalId(null)
              }}
            >
              Choose her
            </Button>
          </div>
        )}
      </Sheet>

      <Toast message="We'll let you know." isOpen={notifyToast} />
    </div>
  )
}
