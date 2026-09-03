import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDemoStore, type MatchAvailabilityDemo, type MatchOutcomeDemo } from '../store/useDemoStore'
import type { ImpactDemoState } from '../lib/impactDemo'

type JumpTarget = 'fresh' | 'pending' | 'active' | 'quiet' | 'graduation'

const jumpTargets: { key: JumpTarget; label: string }[] = [
  { key: 'fresh', label: 'Fresh' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'quiet', label: 'Quiet' },
  { key: 'graduation', label: 'Graduation' },
]

// V2 prototype only — see `MatchOutcomeDemo`. Not a real patient preference.
const matchOutcomeOptions: { key: MatchOutcomeDemo; label: string }[] = [
  { key: 'match_found', label: 'Match found' },
  { key: 'no_match_yet', label: 'No match yet' },
]

// V2 prototype only — see `MatchAvailabilityDemo`. Simulates an async match
// arriving while she's in the "No match yet" waiting state; not real
// asynchronous matching.
const matchAvailabilityOptions: { key: MatchAvailabilityDemo; label: string }[] = [
  { key: 'still_looking', label: 'Still looking' },
  { key: 'match_ready', label: 'Match ready' },
]

const impactTargets: { key: ImpactDemoState; label: string }[] = [
  { key: 'empty', label: 'Empty' },
  { key: 'one', label: '1 completed' },
  { key: 'one_thankyou', label: '1 completed + thank-you' },
  { key: 'four', label: '4 completed' },
]

/**
 * §9 demo controls — collapsible, hidden by default, obviously a demo tool
 * (dashed coral border, never product styling). Drives the moments that
 * need someone on the other end of the conversation.
 *
 * The panel is side-aware: the member journey and the Pal journey each get
 * only their own simulations, because a control that acts on the other
 * side's state is confusing to click and impossible to interpret. The two
 * sides run on separate seeded scenarios by design — the Pal's queue is her
 * own, not the member protagonist's pending request.
 */
export function DemoControls() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isPalSide = pathname.startsWith('/pal')
  const [open, setOpen] = useState(false)
  const memberId = useDemoStore((s) => s.currentMemberId)
  const currentRelationshipId = useDemoStore((s) => s.memberFlow.currentRelationshipId)
  const relationships = useDemoStore((s) => s.relationships)
  const simulatePalAccepts = useDemoStore((s) => s.simulatePalAccepts)
  const simulatePalDeclines = useDemoStore((s) => s.simulatePalDeclines)
  const simulatePalReplies = useDemoStore((s) => s.simulatePalReplies)
  const jumpToState = useDemoStore((s) => s.jumpToState)
  const revivePixelPalReminder = useDemoStore((s) => s.revivePixelPalReminder)
  const simulateLongWait = useDemoStore((s) => s.simulateLongWait)
  const simulateNoAvailablePals = useDemoStore((s) => s.simulateNoAvailablePals)
  const simulateNoTreatmentMatch = useDemoStore((s) => s.simulateNoTreatmentMatch)
  const simulateAllSuggestionsDismissed = useDemoStore((s) => s.simulateAllSuggestionsDismissed)
  const simulatePreviouslyMetPal = useDemoStore((s) => s.simulatePreviouslyMetPal)
  const simulateThinSupply = useDemoStore((s) => s.simulateThinSupply)
  const pauseRelationship = useDemoStore((s) => s.pauseRelationship)
  const resumeRelationship = useDemoStore((s) => s.resumeRelationship)
  const resetDemo = useDemoStore((s) => s.resetDemo)
  const matchOutcomeDemo = useDemoStore((s) => s.matchOutcomeDemo)
  const setMatchOutcomeDemo = useDemoStore((s) => s.setMatchOutcomeDemo)
  const matchAvailabilityDemo = useDemoStore((s) => s.matchAvailabilityDemo)
  const setMatchAvailabilityDemo = useDemoStore((s) => s.setMatchAvailabilityDemo)

  const palId = useDemoStore((s) => s.palFlow.palId)
  const palProfile = useDemoStore((s) => s.palProfiles[palId])
  const simulateMemberReplies = useDemoStore((s) => s.simulateMemberReplies)
  const simulatePalInactivity = useDemoStore((s) => s.simulatePalInactivity)
  const restorePalRequests = useDemoStore((s) => s.restorePalRequests)
  const setPalImpactDemoState = useDemoStore((s) => s.setPalImpactDemoState)
  const simulateNadiaGraduates = useDemoStore((s) => s.simulateNadiaGraduates)

  const currentRel = currentRelationshipId ? relationships[currentRelationshipId] : undefined

  // The Pal's own live thread — whichever of her conversations is open for
  // messages. Only used to fake the other person typing back.
  const palThread = Object.values(relationships).find(
    (r) => r.palId === palId && (r.state === 'active' || r.state === 'quiet'),
  )

  function handleJump(target: JumpTarget) {
    jumpToState(memberId, target)
    const id = useDemoStore.getState().memberFlow.currentRelationshipId
    if (target === 'fresh') navigate('/m')
    else if (target === 'pending') navigate('/m/pending')
    else if (target === 'graduation') navigate(id ? `/m/graduate/${id}` : '/m')
    else navigate(id ? `/m/chat/${id}` : '/m')
  }

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-2">
      {open && (
        <div className="w-72 rounded-card border-2 border-dashed border-coral bg-white p-4 shadow-card">
          <p className="mb-3 text-label-bold text-coral">
            DEMO CONTROLS — NOT PRODUCT UI · {isPalSide ? 'PAL SIDE' : 'MEMBER SIDE'}
          </p>

          {isPalSide ? (
            <>
              <p className="mb-1 text-label-bold text-navy-60">SIMULATE</p>
              <div className="mb-3 flex flex-col gap-1.5">
                <button
                  type="button"
                  disabled={!palThread}
                  onClick={() => palThread && simulateMemberReplies(palThread.id)}
                  className="rounded-field border border-navy-20 px-3 py-2 text-left text-body-sm disabled:opacity-40"
                >
                  Member replies
                </button>
                <button
                  type="button"
                  disabled={!palProfile}
                  onClick={() => {
                    simulatePalInactivity()
                    navigate('/pal/home')
                  }}
                  className="rounded-field border border-navy-20 px-3 py-2 text-left text-body-sm disabled:opacity-40"
                >
                  14 days idle → not taking new
                </button>
              </div>

              <p className="mb-1 text-label-bold text-navy-60">HOME FEED</p>
              <div className="mb-3">
                <button
                  type="button"
                  disabled={!palProfile}
                  onClick={() => {
                    restorePalRequests()
                    navigate('/pal/dashboard')
                  }}
                  className="w-full rounded-field border border-navy-20 px-3 py-2 text-left text-body-sm disabled:opacity-40"
                >
                  Show request reminder
                </button>
              </div>

              {/* Unlike the static IMPACT STATE snapshots below, these two
                  drive the real transition: seed Nadia as a genuine active
                  conversation, then run her through the actual
                  `graduateRelationship` reducer — same capacity release,
                  same unread closure moment, same Impact bump a real
                  Requester-graduates event produces. Land on Pal Home so
                  "Wrapped up / Nadia / New" is immediately visible; the
                  Home-tab Pixel Pal card update is one "Home" tap away via
                  GO TO below — either is a valid way in to the same unread
                  event. */}
              <p className="mb-1 text-label-bold text-navy-60">SIMULATE GRADUATION</p>
              <div className="mb-3 flex flex-col gap-1.5">
                <button
                  type="button"
                  disabled={!palProfile}
                  onClick={() => {
                    simulateNadiaGraduates(true)
                    navigate('/pal/home')
                  }}
                  className="rounded-field border border-navy-20 px-3 py-2 text-left text-body-sm disabled:opacity-40"
                >
                  Nadia graduates + thank-you
                </button>
                <button
                  type="button"
                  disabled={!palProfile}
                  onClick={() => {
                    simulateNadiaGraduates(false)
                    navigate('/pal/home')
                  }}
                  className="rounded-field border border-navy-20 px-3 py-2 text-left text-body-sm disabled:opacity-40"
                >
                  Nadia graduates · no note
                </button>
              </div>

              {/* Prototype/presentation only — not a real Pal setting. Jumps
                  Pal Home's "Your Impact" card straight to one of its four
                  content states, and rewrites the underlying relationships
                  (and, for "4 completed", the people behind them) so the
                  rest of the screen — past conversations, capacity — stays
                  consistent with whichever state is picked, rather than
                  the card just showing a hardcoded number. "4 completed" is
                  the one to reach for before a client presentation. */}
              <p className="mb-1 text-label-bold text-navy-60">DEMO: IMPACT STATE</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {impactTargets.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      setPalImpactDemoState(t.key)
                      navigate('/pal/home')
                    }}
                    className="rounded-field border border-navy-20 px-3 py-1.5 text-label-bold text-navy"
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <p className="mb-1 text-label-bold text-navy-60">GO TO</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => navigate('/pal/about')}
                  className="rounded-field border border-navy-20 px-3 py-1.5 text-label-bold text-navy"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/pal/status')}
                  className="rounded-field border border-navy-20 px-3 py-1.5 text-label-bold text-navy"
                >
                  Status
                </button>
                <button
                  type="button"
                  disabled={!palProfile}
                  onClick={() => navigate('/pal/dashboard')}
                  className="rounded-field border border-navy-20 px-3 py-1.5 text-label-bold text-navy disabled:opacity-40"
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/pal/messages')}
                  className="rounded-field border border-navy-20 px-3 py-1.5 text-label-bold text-navy"
                >
                  Messages
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/pal/home')}
                  className="rounded-field border border-navy-20 px-3 py-1.5 text-label-bold text-navy"
                >
                  Pal home
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mb-1 text-label-bold text-navy-60">SIMULATE</p>
              <div className="mb-3 flex flex-col gap-1.5">
                <button
                  type="button"
                  disabled={!currentRel}
                  onClick={() => {
                    if (!currentRel) return
                    simulatePalAccepts(currentRel.id)
                    // Sends her to Home rather than leaving her on whatever
                    // screen she clicked this from — otherwise "resolves
                    // while she's on Pending" and "resolves while she's
                    // looking at the explanation already" are indistinguishable,
                    // and the TabBar dot / Messages card this now drives
                    // never gets a chance to be seen. Mirrors real life: she
                    // wasn't staring at this screen when it happened.
                    navigate('/home')
                  }}
                  className="rounded-field border border-navy-20 px-3 py-2 text-left text-body-sm disabled:opacity-40"
                >
                  Pal accepts
                </button>
                <button
                  type="button"
                  disabled={!currentRel}
                  onClick={() => {
                    if (!currentRel) return
                    simulatePalDeclines(currentRel.id)
                    navigate('/home')
                  }}
                  className="rounded-field border border-navy-20 px-3 py-2 text-left text-body-sm disabled:opacity-40"
                >
                  Pal declines
                </button>
                <button
                  type="button"
                  disabled={!currentRel}
                  onClick={() => currentRel && simulatePalReplies(currentRel.id)}
                  className="rounded-field border border-navy-20 px-3 py-2 text-left text-body-sm disabled:opacity-40"
                >
                  Pal replies
                </button>
                {/* Previews the requester side of the pause/resume feature
                    without switching into the Pal role to trigger it for
                    real — same "see the other end of the conversation"
                    purpose as "Pal replies" above. */}
                <button
                  type="button"
                  disabled={!currentRel || (currentRel.state !== 'active' && currentRel.state !== 'quiet')}
                  onClick={() => {
                    if (!currentRel) return
                    pauseRelationship(currentRel.id, currentRel.palId, 'until_ready')
                    navigate(`/m/chat/${currentRel.id}`)
                  }}
                  className="rounded-field border border-navy-20 px-3 py-2 text-left text-body-sm disabled:opacity-40"
                >
                  Pal pauses this conversation
                </button>
                <button
                  type="button"
                  disabled={currentRel?.state !== 'paused'}
                  onClick={() => {
                    if (!currentRel) return
                    resumeRelationship(currentRel.id)
                    navigate(`/m/chat/${currentRel.id}`)
                  }}
                  className="rounded-field border border-navy-20 px-3 py-2 text-left text-body-sm disabled:opacity-40"
                >
                  Pal resumes
                </button>
                <button
                  type="button"
                  disabled={currentRel?.state !== 'pending'}
                  onClick={() => {
                    if (currentRel) simulateLongWait(currentRel.id)
                    navigate('/m/pending')
                  }}
                  className="rounded-field border border-navy-20 px-3 py-2 text-left text-body-sm disabled:opacity-40"
                >
                  25h pending → still waiting?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    simulateNoAvailablePals(memberId)
                    navigate('/m/suggestions')
                  }}
                  className="rounded-field border border-navy-20 px-3 py-2 text-left text-body-sm disabled:opacity-40"
                >
                  No Pals available → no matches
                </button>
                <button
                  type="button"
                  onClick={() => {
                    simulateNoTreatmentMatch(memberId)
                    navigate('/m/suggestions')
                  }}
                  className="rounded-field border border-navy-20 px-3 py-2 text-left text-body-sm disabled:opacity-40"
                >
                  No Pal with her treatment → See other Pals
                </button>
                <button
                  type="button"
                  onClick={() => {
                    simulateAllSuggestionsDismissed(memberId)
                    navigate('/m/suggestions')
                  }}
                  className="rounded-field border border-navy-20 px-3 py-2 text-left text-body-sm disabled:opacity-40"
                >
                  Dismiss every suggestion → seen everyone
                </button>
                <button
                  type="button"
                  onClick={() => {
                    simulatePreviouslyMetPal(memberId)
                    navigate('/m/suggestions')
                  }}
                  className="rounded-field border border-navy-20 px-3 py-2 text-left text-body-sm disabled:opacity-40"
                >
                  Talked to a Pal, then left → met before
                </button>
                <button
                  type="button"
                  onClick={() => {
                    simulateThinSupply(memberId)
                    navigate('/m/suggestions')
                  }}
                  className="rounded-field border border-navy-20 px-3 py-2 text-left text-body-sm disabled:opacity-40"
                >
                  Only 2 matches left → thin supply
                </button>
              </div>

              <p className="mb-1 text-label-bold text-navy-60">HOME FEED</p>
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => {
                    revivePixelPalReminder()
                    navigate('/home')
                  }}
                  className="w-full rounded-field border border-navy-20 px-3 py-2 text-left text-body-sm"
                >
                  Show Pal reminder card
                </button>
              </div>

              <p className="mb-1 text-label-bold text-navy-60">JUMP TO STATE</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {jumpTargets.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => handleJump(t.key)}
                    className="rounded-field border border-navy-20 px-3 py-1.5 text-label-bold text-navy"
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* V2 prototype only — decides which way `PixelPalFinding`
                  branches. Not a real matching outcome or patient
                  preference, never shown inside the phone UI. */}
              <p className="mb-1 text-label-bold text-navy-60">MATCH OUTCOME (PROTOTYPE)</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {matchOutcomeOptions.map((option) => {
                  const selected = matchOutcomeDemo === option.key
                  return (
                    <button
                      key={option.key}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setMatchOutcomeDemo(option.key)}
                      className={`rounded-field border px-3 py-1.5 text-label-bold transition-colors ${
                        selected ? 'border-navy bg-navy text-white' : 'border-navy-20 text-navy'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>

              {/* V2 prototype only — simulates an async match arriving while
                  she's on the "No match yet" waiting state (Home's
                  `PixelPalReminderCard`). Not real asynchronous matching. */}
              <p className="mb-1 text-label-bold text-navy-60">MATCH AVAILABILITY (PROTOTYPE)</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {matchAvailabilityOptions.map((option) => {
                  const selected = matchAvailabilityDemo === option.key
                  return (
                    <button
                      key={option.key}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setMatchAvailabilityDemo(option.key)}
                      className={`rounded-field border px-3 py-1.5 text-label-bold transition-colors ${
                        selected ? 'border-navy bg-navy text-white' : 'border-navy-20 text-navy'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              resetDemo()
              navigate('/')
            }}
            className="w-full rounded-field bg-coral px-3 py-2 text-body-sm-bold text-white"
          >
            ↺ Reset demo
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle demo controls"
        className="flex h-11 w-11 items-center justify-center rounded-pill border-2 border-dashed border-coral bg-white text-coral shadow-card"
      >
        {open ? '✕' : '⚙'}
      </button>
    </div>
  )
}
