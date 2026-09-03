import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jordan, members, memberRequests, pals, relationships } from '../lib/seed'
import { rankAllPals, splitByTreatmentMatch, type RankablePal } from '../lib/rankPals'
import { treatmentLabels } from '../lib/treatmentLabels'
import {
  buildImpactDemo,
  IMPACT_DEMO_PERSON_IDS,
  IMPACT_DEMO_RELATIONSHIP_IDS,
  NADIA_THANK_YOU,
  nadiaMessages,
  type ImpactDemoState,
} from '../lib/impactDemo'
import type {
  Availability,
  MemberRequest,
  Message,
  MessageAttachment,
  PalProfile,
  Person,
  Relationship,
  Suggestion,
  SupportNeed,
  TreatmentCode,
} from '../lib/types'

/** A resolved Pal request the member hasn't necessarily seen yet — see
 * `memberFlow.lastOutcome` below. */
type PalOutcome = {
  type: 'declined' | 'accepted'
  relationshipId: string
  palId: string
  occurredAt: string
  seenAt: string | null
}

/**
 * V2 prototype-only branch control for "Finding your Pixel Pal"
 * (`PixelPalFinding`) — not a real matching outcome, not any patient
 * preference or production state. Set from DemoControls' "Match outcome"
 * toggle (member side); see docs/pixel-pal-v2-source-of-truth.md — the real
 * matching algorithm is still an open product question.
 */
export type MatchOutcomeDemo = 'match_found' | 'no_match_yet'

/**
 * V2 prototype-only presentation control simulating an async match arriving
 * while the member is in the "No match yet" waiting state
 * (`pixelPalSearchActive`, below) — set from DemoControls' "Match
 * availability" toggle (member side). Not real asynchronous matching: there
 * is no background job or timer behind this, only a manually-flipped demo
 * flag `PixelPalReminderCard` reads to decide what its Home card shows.
 */
export type MatchAvailabilityDemo = 'still_looking' | 'match_ready'

/**
 * The live demo data layer — spec §2's "critical" instruction: built for
 * all three roles (member, Pal, coordinator) from day one, not modeled
 * around the member and retrofit later. Initialized from the static seed
 * (§6) and persisted to localStorage so a refresh survives (acceptance
 * criterion §11.9); `resetDemo` reseeds on demand.
 *
 * `people` is one dictionary for both members and Pals — not two separate
 * lists — because identity is a `Person` regardless of role, and a member
 * may become a Pal later (spec §6.4/§D11 in the workshop doc).
 *
 * `memberFlow` is the demo protagonist's in-progress request/shortlist —
 * ephemeral wizard state, not part of the §5 data model, but persisted
 * alongside it so a refresh mid-flow doesn't lose her place.
 * `memberFlow.currentRelationshipId` is the "one active Pal per member by
 * default" pointer (spec §6.7) every screen reads instead of re-deriving it.
 *
 * `palFlow` is the same idea for the giving side (spec §2 Phase 2 / workshop
 * §6.5). Its protagonist is Jordan, not Samantha — a deliberate split, not
 * an oversight. The pass-it-forward loop (§5 B1) still means a graduated
 * member is the natural Pal candidate in the *product*, and Graduate.tsx
 * still asks the question and still routes to `/pal` — but giving the two
 * demo journeys two different seeded identities means Samantha is never
 * simultaneously "mid-treatment on Home" and "an active Pal with a queue,"
 * which read as a contradiction rather than a feature when it was one
 * person. Jordan's PalProfile doesn't exist until she applies;
 * `palProfiles[palFlow.palId]` being undefined *is* the "not a Pal yet"
 * state, not a missing-data bug.
 */

function buildInitialState() {
  const people: Record<string, Person> = {}
  for (const m of members) people[m.id] = m
  for (const p of pals) people[p.person.id] = p.person

  const palProfiles: Record<string, PalProfile> = {}
  for (const p of pals) palProfiles[p.person.id] = p.profile

  const memberRequestsById: Record<string, MemberRequest> = {}
  for (const r of memberRequests) memberRequestsById[r.id] = r

  const relationshipsById: Record<string, Relationship> = {}
  for (const r of relationships) relationshipsById[r.id] = r

  return {
    people,
    palProfiles,
    memberRequests: memberRequestsById,
    relationships: relationshipsById,
    currentMemberId: members[0]?.id ?? '',
    memberFlow: {
      draftTreatments: [] as TreatmentCode[],
      draftNeeds: [] as SupportNeed[],
      draftNote: '',
      shortlist: [] as Suggestion[],
      pool: [] as Suggestion[],
      // Available Pals who *don't* share her treatment, held back rather
      // than mixed into the shortlist (see `splitByTreatmentMatch`). This
      // is what makes M4's "no one has been through FET" empty state offer
      // a real "See other Pals" instead of a button that re-runs the same
      // failed match — non-empty means there is genuinely somewhere to go.
      broaderPool: [] as Suggestion[],
      // True once she's taken that offer. Changes what M4 claims the list
      // is: these Pals are honestly framed as "knows this road", never as
      // matches for her treatment.
      broadened: false,
      currentRelationshipId: null as string | null,
      // True once a decline empties both shortlist and pool — distinct from
      // shortlist/pool simply starting empty (zero real matches, spec
      // §11.7's "coordinator personally finding your match" case). Declining
      // everyone she was shown isn't the same situation as there being
      // nothing to show her, and M4 needs to tell those two apart to give
      // the right empty state instead of reusing one that doesn't fit either.
      suggestionsExhausted: false,
      // The last time a request of hers actually resolved (a Pal accepted
      // or declined) — independent of `currentRelationshipId`, which a
      // decline nulls out. Without this, the outcome was only ever visible
      // on whatever screen happened to be open at the moment it happened;
      // this is what lets Messages/TabBar surface it later, and `seenAt`
      // is what lets them stop once she's actually seen it.
      lastOutcome: null as PalOutcome | null,
    },
    palFlow: {
      // Jordan, not Samantha — see the header note. Her PalProfile is
      // absent until she applies, and that absence is the "not a Pal yet"
      // state every /pal screen branches on.
      palId: jordan?.id ?? '',
      draftExperience: [] as TreatmentCode[],
      draftStory: { aboutMe: '', whereIWas: '', whatHelpedMe: '', whatICanOffer: '' },
      // Default 3, range 1–5 (D4) — a default, not a cap she has to discover.
      draftCapacity: 3,
      // Default "within a day" — matches the phrase already used elsewhere
      // in the product (e.g. the member Chat header).
      draftReplyHours: 24,
      draftAttestations: {
        experienceNotAdvice: false,
        clinicalToCareTeam: false,
      },
    },
    // Home dashboard's Pixel Pal reminder card (see PixelPalReminderCard).
    // It's a feature reminder, not a task: it surfaces every Nth Home visit
    // rather than every visit, and retires permanently once she's either
    // seen the real invite on Contacts/M1 or dismissed it here.
    homeVisitCount: 0,
    pixelPalReminderRetired: false,
    // Demo-control override — shows the reminder regardless of where the
    // visit counter currently sits. Not a product concept.
    pixelPalReminderForced: false,
    // V2 prototype-only — see `MatchOutcomeDemo` above. Defaults to the
    // happy path so the flow demos end-to-end without touching the panel.
    matchOutcomeDemo: 'match_found' as MatchOutcomeDemo,
    // V2 prototype flow state — true once she's reached `/m/no-match-yet`
    // (see `beginPixelPalSearch`), false for a cold/new patient. Not itself
    // a demo control: it's set automatically by the No Match Yet screen,
    // not flipped from the panel.
    pixelPalSearchActive: false,
    // V2 prototype-only — see `MatchAvailabilityDemo` above.
    matchAvailabilityDemo: 'still_looking' as MatchAvailabilityDemo,
    // V2 prototype flow state — true once she's confirmed "Find someone
    // else" on the mocked River connection (`PixelPalChat`), so that screen
    // knows not to render River as still active if she navigates back to
    // it. Cleared again once a fresh matching cycle starts (`PixelPalFinding`
    // resets it on mount). Not a demo control, and not a real relationship
    // model — there's only ever one mocked match in this prototype.
    pixelPalMatchEnded: false,
  }
}

type DemoData = ReturnType<typeof buildInitialState>

function rankableFrom(
  palProfiles: DemoData['palProfiles'],
  people: DemoData['people'],
  excludeIds: (string | undefined)[] = [],
): RankablePal[] {
  return Object.values(palProfiles)
    .filter((profile) => !excludeIds.includes(profile.personId))
    // No admin review step — a profile existing in `palProfiles` at all
    // already means she's an active Pal (see `submitPalApplication`).
    // Eligibility from here is purely `hasHeadroom` below (capacity/
    // availability), not an application-status gate.
    .map((profile) => ({
      personId: profile.personId,
      profile,
      age: people[profile.personId]?.age,
      kind: people[profile.personId]?.kind,
    }))
}

function latestRequestFor(memberRequests: DemoData['memberRequests'], memberId: string) {
  return Object.values(memberRequests)
    .filter((r) => r.memberId === memberId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
}

/**
 * The M4 shortlist fields, derived from one ranked list in one place —
 * every screen that regenerates suggestions (submit, restart, find someone
 * else) has to make the same treatment-match split, and three copies of it
 * is three chances for one of them to quietly start padding the shortlist
 * with non-matches.
 *
 * `broadened` picks which group she's looking at; the other group is only
 * carried in `broaderPool` while it's still an unopened offer.
 */
function shortlistFields(ranked: Suggestion[], broadened = false) {
  const { matched, broader } = splitByTreatmentMatch(ranked)
  const source = broadened ? broader : matched
  return {
    shortlist: source.slice(0, 3),
    pool: source.slice(3),
    broaderPool: broadened ? [] : broader,
    broadened,
    suggestionsExhausted: false,
  }
}

/**
 * One-in-one-out: drop `palId`'s card off the visible shortlist and pull the
 * next-ranked Pal in from the pool, if there's depth — the same "someone
 * else steps up" behavior regardless of *why* she's off the list, whether
 * she said "Not for me" herself (`declineSuggestion`) or a Pal declined her
 * (`declinePalRequest`, `simulatePalDeclines`). Landing on M4 after a real
 * decline should look like the same screen a fresh search shows — up to 3
 * cards, backfilled — not a thinned-out leftover list.
 *
 * `null` when `palId` isn't actually on the shortlist (already backfilled,
 * already gone) — mirrors `declineSuggestion`'s old duplicate-call guard,
 * now shared so a stale event can't double-consume the pool from either
 * caller.
 */
function backfillAfterDecline(
  shortlist: Suggestion[],
  pool: Suggestion[],
  palId: string,
): { shortlist: Suggestion[]; pool: Suggestion[]; suggestionsExhausted: boolean } | null {
  if (!shortlist.some((s) => s.palId === palId)) return null
  const visible = shortlist.filter((s) => s.palId !== palId)
  if (pool.length === 0) {
    // Nothing left to backfill with. If that was her last visible
    // suggestion too, the pool she was shown is now exhausted — not a
    // "no matches" situation, just "none of these, right now."
    return { shortlist: visible, pool, suggestionsExhausted: visible.length === 0 }
  }
  const [next, ...rest] = pool
  return { shortlist: [...visible, next], pool: rest, suggestionsExhausted: false }
}

function sharedContextFor(memberTreatments: TreatmentCode[], palExperience: TreatmentCode[]): string {
  const overlap = memberTreatments.filter((t) => palExperience.includes(t))
  if (overlap.length === 0) return "You're both part of the same fertility journey."
  const label = treatmentLabels[overlap[0]]?.acronym ?? overlap[0]
  return `You've both been through ${label}.`
}

/**
 * Give a Pal her slot back when a relationship stops being live.
 *
 * `activeCount` is what capacity and shortlist headroom are computed from,
 * so it has to fall as well as rise — otherwise a Pal silently fills up
 * forever and quietly disappears from every future shortlist. Returns the
 * profiles map unchanged when there's nothing to release.
 */
function releasePalSlot(palProfiles: DemoData['palProfiles'], palId: string) {
  const profile = palProfiles[palId]
  if (!profile || profile.activeCount <= 0) return palProfiles
  return { ...palProfiles, [palId]: { ...profile, activeCount: profile.activeCount - 1 } }
}

function nowIso() {
  return new Date().toISOString()
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}`
}

/** `lastOutcome` only ever describes the live member's own flow — a Pal
 * resolving someone else's request (a different `memberId`) shouldn't
 * surface as "something happened" on a screen that isn't hers. */
function palOutcome(rel: Relationship, type: PalOutcome['type'], currentMemberId: string): PalOutcome | null {
  if (rel.memberId !== currentMemberId) return null
  return { type, relationshipId: rel.id, palId: rel.palId, occurredAt: nowIso(), seenAt: null }
}

type DemoState = DemoData & {
  resetDemo: () => void

  // M3 — draft request wizard
  startMemberFlow: (memberId: string) => void
  setDraftTreatments: (codes: TreatmentCode[]) => void
  setDraftNeeds: (needs: SupportNeed[]) => void
  setDraftNote: (note: string) => void
  submitMemberRequest: (memberId: string) => void

  // M4 — shortlist
  declineSuggestion: (palId: string) => void
  showBroaderPals: () => void
  chooseSuggestion: (palId: string) => void
  restartSuggestions: (memberId: string) => void

  // M5/M6 — intro note, pending, withdraw
  sendIntroNote: (memberId: string, palId: string, note: string) => string
  withdrawRequest: (relationshipId: string) => void
  // M6 — 24h+ still-pending notice: "keep waiting" just quiets the notice,
  // never touches `state`.
  acknowledgeWaiting: (relationshipId: string) => void
  // Marks `memberFlow.lastOutcome` seen — called once she's actually reached
  // the screen that explains it (Pending's declined branch, or Chat), not
  // just because a card mentioning it rendered.
  acknowledgeOutcome: () => void

  // M8 — chat
  sendMessage: (
    relationshipId: string,
    senderId: string,
    body: string,
    kind?: Message['kind'],
    attachment?: MessageAttachment,
  ) => void
  setMilestoneSharing: (relationshipId: string, enabled: boolean, items: string[]) => void

  // M9 — outcomes
  // Conversation-level pause — currently only reachable from the Pal side
  // (PalChat's "Pause this conversation"). `initiatorId` is whoever paused
  // it, recorded so `resumeRelationship` can be limited to that same
  // person; `duration` is her stated intent, not an auto-resume timer.
  pauseRelationship: (relationshipId: string, initiatorId: string, duration: 'one_week' | 'until_ready') => void
  resumeRelationship: (relationshipId: string) => void
  findSomeoneElse: (memberId: string, relationshipId: string) => void
  // `opts.thankYouNote` carries whatever the Requester left, if anything.
  // `opts.seenByPal` is for the one call site where she's already watching
  // this happen live (`PalGraduate`'s own "Wrap up together" flow) — it
  // marks the closure moment seen at creation instead of leaving it unread
  // for her to "discover" a screen she was just standing on.
  graduateRelationship: (relationshipId: string, opts?: { thankYouNote?: string; seenByPal?: boolean }) => void
  // Marks the one-time Graduation/closure screen seen — idempotent, and a
  // no-op on anything that isn't `graduated` (see `graduationSeenAt` in
  // types.ts for what "unread" means here and why it's one field, not a
  // separate notification store).
  acknowledgeGraduation: (relationshipId: string) => void
  // Report — a safety ending, not a pause/investigate-while-active step
  // (spec: "the match ends immediately and the issue is escalated
  // internally"). One action for both directions: `reporterId` is whichever
  // side filed it, and is all that's needed to tell requester-reports-Pal
  // from Pal-reports-requester apart.
  reportRelationship: (relationshipId: string, reporterId: string, reason: string, note?: string) => void

  // P1–P5 — becoming a Pal (workshop §6.5 step 1), no admin review step
  startPalApplication: () => void
  setPalDraftExperience: (codes: TreatmentCode[]) => void
  setPalDraftStory: (story: Partial<PalProfile['story']>) => void
  setPalDraftCapacity: (capacity: number) => void
  setPalDraftReplyHours: (hours: number) => void
  setPalDraftAttestation: (key: keyof NonNullable<PalProfile['attestations']>, value: boolean) => void
  submitPalApplication: () => void

  // P8 — availability, capacity, reply time, editing applied info (workshop §6.5 step 3)
  setPalAvailability: (availability: Availability) => void
  setPalCapacity: (capacity: number) => void
  setPalReplyHours: (hours: number) => void
  setPalStory: (story: Partial<PalProfile['story']>) => void

  // P9 — a request arrives (workshop §6.5 step 4)
  acceptPalRequest: (relationshipId: string) => void
  declinePalRequest: (relationshipId: string) => void

  // §9 — demo controls
  simulatePalAccepts: (relationshipId: string) => void
  simulatePalDeclines: (relationshipId: string) => void
  simulatePalReplies: (relationshipId: string, body?: string) => void
  jumpToState: (memberId: string, target: 'fresh' | 'pending' | 'active' | 'quiet' | 'graduation') => void
  simulateMemberReplies: (relationshipId: string, body?: string) => void
  simulatePalInactivity: () => void
  restorePalRequests: () => void
  simulateLongWait: (relationshipId: string) => void
  simulateNoAvailablePals: (memberId: string) => void
  simulateNoTreatmentMatch: (memberId: string) => void
  simulateAllSuggestionsDismissed: (memberId: string) => void
  simulatePreviouslyMetPal: (memberId: string) => void
  simulateThinSupply: (memberId: string) => void
  // "SIMULATE GRADUATION" — unlike the static IMPACT STATE snapshots below,
  // this drives the real transition: seeds Nadia as a genuine active
  // conversation (real messages, real capacity slot taken), then calls the
  // real `graduateRelationship` on her, exactly as `member/Graduate.tsx`
  // would. What it produces — the capacity release, the unread closure
  // moment, the Impact bump — is the same state a real Requester-graduates
  // event produces, not a screen mocked up to look like one.
  simulateNadiaGraduates: (withThankYou: boolean) => void
  // Demo control for Pal Home's "Your Impact" card (client-presentation
  // only) — jumps straight to one of its four content states. See
  // `setPalImpactDemoState` below for why this rewrites real relationship
  // records instead of faking numbers on the card.
  setPalImpactDemoState: (target: ImpactDemoState) => void

  // Home dashboard's Pixel Pal reminder card
  registerHomeVisit: () => void
  retirePixelPalReminder: () => void
  revivePixelPalReminder: () => void

  // V2 prototype — "Finding your Pixel Pal" demo branch (see `MatchOutcomeDemo`)
  setMatchOutcomeDemo: (outcome: MatchOutcomeDemo) => void

  // V2 prototype — "No match yet" waiting/searching Home state
  beginPixelPalSearch: () => void
  setMatchAvailabilityDemo: (availability: MatchAvailabilityDemo) => void

  // V2 prototype — "Find someone else" from the mocked River chat
  endPixelPalMatch: () => void
  // Clears `pixelPalMatchEnded` — called when a fresh matching cycle starts
  // (`PixelPalFinding` on mount), so a new mocked match isn't treated as the
  // one she just left.
  beginNewPixelPalMatch: () => void

  // V2 prototype — Social Profile edit (reuses the Main App's existing
  // Social Profile, not a separate Pixel Pal profile — see
  // docs/pixel-pal-v2-source-of-truth.md). Writes straight to the current
  // member's `Person` record; `SocialProfileEdit` holds its own draft state
  // and only calls this on "Save Changes", so Back/cancel applies nothing.
  updateSocialProfile: (
    patch: Partial<Pick<Person, 'displayName' | 'usesAlias' | 'avatarUrl' | 'signature' | 'aboutMe' | 'socialLinks'>>,
  ) => void
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),

      resetDemo: () => set(buildInitialState()),

      startMemberFlow: (memberId) =>
        set((state) => {
          const prior = latestRequestFor(state.memberRequests, memberId)
          return {
            memberFlow: {
              ...state.memberFlow,
              draftTreatments: prior ? [...prior.treatments] : [],
              draftNeeds: [],
              draftNote: '',
              shortlist: [],
              pool: [],
              broaderPool: [],
              broadened: false,
              suggestionsExhausted: false,
            },
          }
        }),

      setDraftTreatments: (codes) =>
        set((state) => ({ memberFlow: { ...state.memberFlow, draftTreatments: codes } })),

      setDraftNeeds: (needs) => set((state) => ({ memberFlow: { ...state.memberFlow, draftNeeds: needs } })),

      setDraftNote: (note) => set((state) => ({ memberFlow: { ...state.memberFlow, draftNote: note } })),

      submitMemberRequest: (memberId) =>
        set((state) => {
          const request: MemberRequest = {
            id: newId(`request-${memberId}`),
            memberId,
            treatments: state.memberFlow.draftTreatments,
            needs: state.memberFlow.draftNeeds,
            note: state.memberFlow.draftNote || undefined,
            createdAt: nowIso(),
          }
          // Exclude herself: once she's been through the Pal flow she has a
          // PalProfile of her own, and she must never be suggested to herself.
          const rankable = rankableFrom(state.palProfiles, state.people, [memberId])
          const ranked = rankAllPals(request, rankable, state.people[memberId]?.age)
          return {
            memberRequests: { ...state.memberRequests, [request.id]: request },
            memberFlow: { ...state.memberFlow, ...shortlistFields(ranked) },
          }
        }),

      declineSuggestion: (palId) =>
        set((state) => {
          // "Not for me" (spec M4) — no reason requested, nothing recorded
          // beyond removing her from view; card animates out and the next-
          // ranked Pal (if any) backfills from the pool. Guard against a
          // stale/duplicate call built into `backfillAfterDecline`: the
          // cards' exit animation has no `mode="wait"`, so a fast double-tap
          // can land on a card that's still visible mid-exit but already
          // gone from `shortlist` — without it, that second call would still
          // consume a pool item and re-append it, shortlist silently growing
          // past 3.
          const result = backfillAfterDecline(state.memberFlow.shortlist, state.memberFlow.pool, palId)
          if (!result) return {}
          return { memberFlow: { ...state.memberFlow, ...result } }
        }),

      // M4 empty state's "Show me these again" — re-runs the same matching
      // `submitMemberRequest` does, against her existing request (never
      // re-asking M3), so she lands back in the normal 3-suggestion
      // experience rather than a dead end. Stays in whichever list she was
      // looking at: having chosen to see Pals beyond her treatment, being
      // silently dropped back to an empty matched list would read as the
      // refresh having failed.
      restartSuggestions: (memberId) =>
        set((state) => {
          const request = latestRequestFor(state.memberRequests, memberId)
          if (!request) return {}
          const rankable = rankableFrom(state.palProfiles, state.people, [memberId])
          const ranked = rankAllPals(request, rankable, state.people[memberId]?.age)
          return {
            memberFlow: { ...state.memberFlow, ...shortlistFields(ranked, state.memberFlow.broadened) },
          }
        }),

      // M4's "See other Pals" — the way out of "nobody available has been
      // through your treatment." Not another scan (that would return the
      // same nothing): it opens the group `shortlistFields` deliberately
      // held back, available Pals whose experience is different.
      showBroaderPals: () =>
        set((state) => {
          const broader = state.memberFlow.broaderPool
          if (broader.length === 0) return {}
          return {
            memberFlow: {
              ...state.memberFlow,
              shortlist: broader.slice(0, 3),
              pool: broader.slice(3),
              broaderPool: [],
              broadened: true,
              suggestionsExhausted: false,
            },
          }
        }),

      chooseSuggestion: (palId) =>
        set((state) => ({
          memberFlow: {
            ...state.memberFlow,
            shortlist: state.memberFlow.shortlist.map((s) => {
              if (s.palId === palId) return { ...s, state: 'chosen' as const }
              if (s.state === 'chosen') return { ...s, state: 'offered' as const }
              return s
            }),
          },
        })),

      sendIntroNote: (memberId, palId, note) => {
        const id = newId(`rel-${memberId}-${palId}`)
        set((state) => {
          const request = latestRequestFor(state.memberRequests, memberId)
          const palExperience = state.palProfiles[palId]?.experience ?? []
          const relationship: Relationship = {
            id,
            memberId,
            palId,
            state: 'pending',
            introNote: note,
            messages: note
              ? [{ id: newId('msg'), senderId: memberId, body: note, kind: 'text', sentAt: nowIso() }]
              : [],
            sharedContext: sharedContextFor(request?.treatments ?? [], palExperience),
            createdAt: nowIso(),
            lastMessageAt: note ? nowIso() : undefined,
            milestoneSharing: { enabled: false, items: [] },
          }
          return {
            relationships: { ...state.relationships, [id]: relationship },
            memberFlow: { ...state.memberFlow, currentRelationshipId: id },
          }
        })
        return id
      },

      withdrawRequest: (relationshipId) =>
        set((state) => {
          const rel = state.relationships[relationshipId]
          if (!rel) return {}
          return {
            relationships: {
              ...state.relationships,
              [relationshipId]: { ...rel, state: 'archived', endedReason: 'withdrawn', endedAt: nowIso() },
            },
            memberFlow: {
              ...state.memberFlow,
              currentRelationshipId: null,
              // Symmetric with chooseSuggestion — she's free to pick again.
              shortlist: state.memberFlow.shortlist.map((s) =>
                s.palId === rel.palId ? { ...s, state: 'offered' as const } : s,
              ),
            },
          }
        }),

      acknowledgeWaiting: (relationshipId) =>
        set((state) => {
          const rel = state.relationships[relationshipId]
          if (!rel) return {}
          return {
            relationships: {
              ...state.relationships,
              [relationshipId]: { ...rel, waitingAcknowledgedAt: nowIso() },
            },
          }
        }),

      acknowledgeOutcome: () =>
        set((state) => {
          if (!state.memberFlow.lastOutcome || state.memberFlow.lastOutcome.seenAt) return {}
          return {
            memberFlow: {
              ...state.memberFlow,
              lastOutcome: { ...state.memberFlow.lastOutcome, seenAt: nowIso() },
            },
          }
        }),

      sendMessage: (relationshipId, senderId, body, kind = 'text', attachment) =>
        set((state) => {
          const rel = state.relationships[relationshipId]
          if (!rel) return {}
          const message: Message = { id: newId('msg'), senderId, body, kind, sentAt: nowIso(), attachment }
          return {
            relationships: {
              ...state.relationships,
              [relationshipId]: {
                ...rel,
                messages: [...rel.messages, message],
                lastMessageAt: message.sentAt,
                // A message on a quiet thread revives it.
                state: rel.state === 'quiet' ? 'active' : rel.state,
              },
            },
          }
        }),

      setMilestoneSharing: (relationshipId, enabled, items) =>
        set((state) => {
          const rel = state.relationships[relationshipId]
          if (!rel) return {}
          return {
            relationships: {
              ...state.relationships,
              [relationshipId]: { ...rel, milestoneSharing: { enabled, items } },
            },
          }
        }),

      // Stepping away from *this* conversation only. Deliberately does not
      // touch `palProfiles` at all — no `releasePalSlot`, no `availability`
      // change — because pausing one relationship must not read as capacity
      // opening up or as her going globally unavailable (that's
      // `setPalAvailability`'s job, a separate decision with a separate
      // scope). The requester is not rematched: her slot with this Pal is
      // still spoken for, just inactive for now.
      pauseRelationship: (relationshipId, initiatorId, duration) =>
        set((state) => {
          const rel = state.relationships[relationshipId]
          if (!rel) return {}
          return {
            relationships: {
              ...state.relationships,
              [relationshipId]: {
                ...rel,
                state: 'paused',
                pausedBy: initiatorId,
                pauseDuration: duration,
                pausedAt: nowIso(),
              },
            },
          }
        }),

      // Only the person who paused it can bring it back — enforced by the
      // UI (the resume action only ever renders for `pausedBy`), and here
      // too in case a future caller forgets. Returns straight to `active`:
      // there's no need to reconstruct whatever pre-pause state it was in,
      // since `quiet` is itself just "active, nothing said in a while."
      resumeRelationship: (relationshipId) =>
        set((state) => {
          const rel = state.relationships[relationshipId]
          if (!rel || rel.state !== 'paused') return {}
          return {
            relationships: {
              ...state.relationships,
              [relationshipId]: {
                ...rel,
                state: 'active',
                pausedBy: undefined,
                pauseDuration: undefined,
                pausedAt: undefined,
              },
            },
          }
        }),

      findSomeoneElse: (memberId, relationshipId) =>
        set((state) => {
          const rel = state.relationships[relationshipId]
          const request = latestRequestFor(state.memberRequests, memberId)
          if (!rel || !request) return {}
          // She is *not* excluded from the re-ranking. Leaving a conversation
          // isn't a judgement on the match — her slot is released right below,
          // so she's genuinely eligible again, and the ranking has no reason
          // to score her differently than it did the first time. Suppressing
          // her here would also be inconsistent: `restartSuggestions` and any
          // new request never filtered her out, so she could reappear by
          // those routes anyway — just with no acknowledgement that they'd
          // met. The honest version is to offer her and say so, which is what
          // `palHistoryFor` reads the `endedReason` below for.
          const rankable = rankableFrom(state.palProfiles, state.people, [memberId])
          const ranked = rankAllPals(request, rankable, state.people[memberId]?.age)
          return {
            relationships: {
              ...state.relationships,
              [relationshipId]: {
                ...rel,
                state: 'archived',
                endedReason: 'found_someone_else',
                endedAt: nowIso(),
              },
            },
            palProfiles: releasePalSlot(state.palProfiles, rel.palId),
            memberFlow: {
              ...state.memberFlow,
              ...shortlistFields(ranked),
              currentRelationshipId: null,
            },
          }
        }),

      graduateRelationship: (relationshipId, opts) =>
        set((state) => {
          const rel = state.relationships[relationshipId]
          if (!rel || rel.state === 'graduated') return {}
          // Graduating both frees her slot and is the one event that counts
          // toward the impact surface — a relationship seen through to the end.
          const released = releasePalSlot(state.palProfiles, rel.palId)
          const profile = released[rel.palId]
          return {
            relationships: {
              ...state.relationships,
              [relationshipId]: {
                ...rel,
                state: 'graduated',
                thankYouNote: opts?.thankYouNote ?? rel.thankYouNote,
                // Unset (unread) unless she's already watching this happen
                // live — see the `opts.seenByPal` note on the interface
                // above and `graduationSeenAt`'s doc comment in types.ts.
                graduationSeenAt: opts?.seenByPal ? nowIso() : rel.graduationSeenAt,
              },
            },
            palProfiles: profile
              ? { ...released, [rel.palId]: { ...profile, supportedCount: profile.supportedCount + 1 } }
              : released,
          }
        }),

      acknowledgeGraduation: (relationshipId) =>
        set((state) => {
          const rel = state.relationships[relationshipId]
          if (!rel || rel.state !== 'graduated' || rel.graduationSeenAt) return {}
          return {
            relationships: {
              ...state.relationships,
              [relationshipId]: { ...rel, graduationSeenAt: nowIso() },
            },
          }
        }),

      // A safety ending, not a pause and not "find someone else" — spec:
      // the match ends immediately, on either side's say-so, with no wait
      // for admin review and no explanation owed to the reported person.
      // Shared by both directions rather than two functions because the
      // state work is identical either way (archive, free the Pal's slot,
      // record who/why for the record); only the requester's re-routing
      // back into matching is direction-specific.
      reportRelationship: (relationshipId, reporterId, reason, note) =>
        set((state) => {
          const rel = state.relationships[relationshipId]
          if (!rel) return {}

          // `activeCount` only ever counted this relationship once the Pal
          // accepted (`acceptPalRequest`) — reporting a still-`pending` one
          // (in principle reachable, even though neither Chat screen offers
          // Report before that point) must not release a slot that was
          // never taken.
          const palProfiles =
            rel.state === 'pending' ? state.palProfiles : releasePalSlot(state.palProfiles, rel.palId)
          // Only the demo's live member persona's own `memberFlow` is ever
          // touched here — same guard `palOutcome` uses elsewhere, so
          // reporting a relationship that happens to belong to some other
          // seeded member doesn't reach into her shortlist/pointer.
          let memberFlowPatch: Partial<DemoData['memberFlow']> = {}
          if (rel.memberId === state.currentMemberId) {
            if (reporterId !== rel.palId) {
              // The requester reported — she gets a fresh path back into
              // matching immediately, no admin wait (spec). The reported
              // Pal is left out of *this* rerank only — unlike
              // `findSomeoneElse`, where leaving isn't a judgement on the
              // match, a report is exactly that, so resurfacing her in the
              // very next list would be wrong. (Not a permanent blocklist —
              // out of scope for this prototype.)
              const request = latestRequestFor(state.memberRequests, rel.memberId)
              if (request) {
                const rankable = rankableFrom(palProfiles, state.people, [rel.memberId, rel.palId])
                const ranked = rankAllPals(request, rankable, state.people[rel.memberId]?.age)
                memberFlowPatch = { ...shortlistFields(ranked) }
              }
            }
            // Either direction: this relationship is no longer live, so
            // nothing should keep pointing at it — same as every other
            // archiving transition above. When the Pal reported *her*, this
            // is the only visible effect: no outcome, no explanation, the
            // match is simply no longer active (spec's privacy rule).
            memberFlowPatch.currentRelationshipId = null
          }

          return {
            relationships: {
              ...state.relationships,
              [relationshipId]: {
                ...rel,
                state: 'archived',
                endedReason: 'reported',
                endedAt: nowIso(),
                reportedBy: reporterId,
                reportReason: reason,
                reportNote: note || undefined,
              },
            },
            palProfiles,
            ...(Object.keys(memberFlowPatch).length > 0
              ? { memberFlow: { ...state.memberFlow, ...memberFlowPatch } }
              : {}),
          }
        }),

      simulatePalAccepts: (relationshipId) =>
        set((state) => {
          const rel = state.relationships[relationshipId]
          if (!rel) return {}
          const message: Message = {
            id: newId('msg'),
            senderId: rel.palId,
            kind: 'text',
            sentAt: nowIso(),
            body: "Hi! Thank you for reaching out — I'd love to help. Tell me a bit more about where you are right now.",
          }
          const outcome = palOutcome(rel, 'accepted', state.currentMemberId)
          return {
            relationships: {
              ...state.relationships,
              [relationshipId]: {
                ...rel,
                state: 'active',
                messages: [...rel.messages, message],
                lastMessageAt: message.sentAt,
              },
            },
            ...(outcome ? { memberFlow: { ...state.memberFlow, lastOutcome: outcome } } : {}),
          }
        }),

      simulatePalDeclines: (relationshipId) =>
        set((state) => {
          const rel = state.relationships[relationshipId]
          if (!rel) return {}
          const outcome = palOutcome(rel, 'declined', state.currentMemberId)
          // Same one-in-one-out as "Not for me" — she lands back on M4 to a
          // full shortlist backfilled from the pool, not a thinned-out
          // leftover list (see `backfillAfterDecline`).
          const backfill = backfillAfterDecline(state.memberFlow.shortlist, state.memberFlow.pool, rel.palId)
          return {
            relationships: {
              ...state.relationships,
              // Recorded, never shown — `palHistoryFor` reads this precisely
              // so it knows to stay silent if this Pal is ever suggested to
              // her again. The decline stays private (see declinePalRequest).
              [relationshipId]: { ...rel, state: 'archived', endedReason: 'declined_by_pal', endedAt: nowIso() },
            },
            memberFlow: {
              ...state.memberFlow,
              currentRelationshipId: null,
              ...backfill,
              ...(outcome ? { lastOutcome: outcome } : {}),
            },
          }
        }),

      simulatePalReplies: (relationshipId, body) =>
        set((state) => {
          const rel = state.relationships[relationshipId]
          if (!rel) return {}
          const message: Message = {
            id: newId('msg'),
            senderId: rel.palId,
            kind: 'text',
            sentAt: nowIso(),
            body: body ?? "Just checking in — how are you feeling today?",
          }
          return {
            relationships: {
              ...state.relationships,
              [relationshipId]: {
                ...rel,
                state: rel.state === 'quiet' ? 'active' : rel.state,
                messages: [...rel.messages, message],
                lastMessageAt: message.sentAt,
              },
            },
          }
        }),

      jumpToState: (memberId, target) =>
        set((state) => {
          // Archive whatever the member currently has, then rebuild toward
          // the requested state — a demo convenience, not user-facing flow.
          const relationshipsCopy = { ...state.relationships }
          const existingId = state.memberFlow.currentRelationshipId
          if (existingId && relationshipsCopy[existingId]) {
            relationshipsCopy[existingId] = { ...relationshipsCopy[existingId], state: 'archived' }
          }

          if (target === 'fresh') {
            return {
              relationships: relationshipsCopy,
              memberFlow: { ...state.memberFlow, shortlist: [], pool: [], currentRelationshipId: null },
            }
          }

          const request =
            latestRequestFor(state.memberRequests, memberId) ??
            ({
              id: newId(`request-${memberId}`),
              memberId,
              treatments: [] as TreatmentCode[],
              needs: ['emotional_side'] as SupportNeed[],
              createdAt: nowIso(),
            } satisfies MemberRequest)
          const rankable = rankableFrom(state.palProfiles, state.people, [memberId])
          const ranked = rankAllPals(request, rankable, state.people[memberId]?.age)
          const chosen = ranked[0]
          if (!chosen) return { relationships: relationshipsCopy }

          const id = newId(`rel-${memberId}-${chosen.palId}`)
          const palExperience = state.palProfiles[chosen.palId]?.experience ?? []
          const introMessage: Message = {
            id: newId('msg'),
            senderId: memberId,
            body: 'Hi — would love to talk when you have a moment.',
            kind: 'text',
            sentAt: nowIso(),
          }

          if (target === 'pending') {
            return {
              memberRequests: { ...state.memberRequests, [request.id]: request },
              relationships: {
                ...relationshipsCopy,
                [id]: {
                  id,
                  memberId,
                  palId: chosen.palId,
                  state: 'pending',
                  introNote: introMessage.body,
                  messages: [introMessage],
                  sharedContext: sharedContextFor(request.treatments, palExperience),
                  createdAt: nowIso(),
                  lastMessageAt: nowIso(),
                  milestoneSharing: { enabled: false, items: [] },
                },
              },
              memberFlow: {
                ...state.memberFlow,
                shortlist: ranked.slice(0, 3).map((s) => (s.palId === chosen.palId ? { ...s, state: 'chosen' } : s)),
                pool: ranked.slice(3),
                currentRelationshipId: id,
              },
            }
          }

          const replyMessage: Message = {
            id: newId('msg'),
            senderId: chosen.palId,
            body: "Hi! I'd love to help — tell me more about where you are right now.",
            kind: 'text',
            sentAt: nowIso(),
          }

          const lastMessageAt =
            target === 'quiet' ? new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() : nowIso()

          const built: Relationship = {
            id,
            memberId,
            palId: chosen.palId,
            state: target === 'graduation' ? 'graduated' : target === 'quiet' ? 'quiet' : 'active',
            introNote: introMessage.body,
            messages: [introMessage, replyMessage],
            sharedContext: sharedContextFor(request.treatments, palExperience),
            createdAt: nowIso(),
            lastMessageAt,
            milestoneSharing: { enabled: false, items: [] },
          }

          return {
            memberRequests: { ...state.memberRequests, [request.id]: request },
            relationships: { ...relationshipsCopy, [id]: built },
            memberFlow: { ...state.memberFlow, shortlist: [], pool: [], currentRelationshipId: id },
          }
        }),

      // -----------------------------------------------------------------
      // Pal journey (workshop doc §6.5) — the giving side.

      startPalApplication: () =>
        set((state) => {
          // Prefill her experience from her own treatment record, same
          // reasoning as M3: the app already knows this, and asking her to
          // recite it cold is the friction the redesign removes. Unlike M3
          // this step still *shows*, because here it's a declaration of what
          // she's offering to support on — hers to edit, not ours to assume.
          const own = latestRequestFor(state.memberRequests, state.palFlow.palId)
          return {
            palFlow: {
              ...state.palFlow,
              draftExperience: own ? [...own.treatments] : [],
              draftStory: { aboutMe: '', whereIWas: '', whatHelpedMe: '', whatICanOffer: '' },
              draftCapacity: 3,
              draftReplyHours: 24,
              draftAttestations: {
                experienceNotAdvice: false,
                clinicalToCareTeam: false,
              },
            },
          }
        }),

      setPalDraftExperience: (codes) =>
        set((state) => ({ palFlow: { ...state.palFlow, draftExperience: codes } })),

      setPalDraftStory: (story) =>
        set((state) => ({
          palFlow: { ...state.palFlow, draftStory: { ...state.palFlow.draftStory, ...story } },
        })),

      setPalDraftCapacity: (capacity) =>
        set((state) => ({
          palFlow: { ...state.palFlow, draftCapacity: Math.min(5, Math.max(1, capacity)) },
        })),

      setPalDraftReplyHours: (hours) =>
        set((state) => ({ palFlow: { ...state.palFlow, draftReplyHours: hours } })),

      setPalDraftAttestation: (key, value) =>
        set((state) => ({
          palFlow: {
            ...state.palFlow,
            draftAttestations: { ...state.palFlow.draftAttestations, [key]: value },
          },
        })),

      // No admin review — a submitted application is an active Pal, full
      // stop. `applicationStatus` doesn't exist on `PalProfile` anymore; the
      // profile's mere presence in `palProfiles` is what "active" means (see
      // `rankableFrom`, and the header note above).
      submitPalApplication: () =>
        set((state) => {
          const { palId, draftStory, draftExperience, draftCapacity, draftReplyHours, draftAttestations } =
            state.palFlow
          const profile: PalProfile = {
            personId: palId,
            story: draftStory,
            experience: draftExperience,
            capacity: draftCapacity,
            activeCount: 0,
            availability: 'available',
            typicalReplyHours: draftReplyHours,
            lastActiveAt: nowIso(),
            supportedCount: 0,
            attestations: draftAttestations,
            appliedAt: nowIso(),
          }
          return { palProfiles: { ...state.palProfiles, [palId]: profile } }
        }),

      setPalAvailability: (availability) =>
        set((state) => {
          const profile = state.palProfiles[state.palFlow.palId]
          if (!profile) return {}

          // Switching to "not taking new" must not leave a member's request
          // sitting with a Pal who's just told the app she isn't reachable
          // for new matches — same effect as declining each one herself
          // (`declinePalRequest`), just applied to all of them at once.
          // Existing active/quiet conversations are untouched; this only
          // ever looks at `pending`, and going back to `available` closes
          // nothing.
          let relationships = state.relationships
          let memberFlowPatch: Partial<DemoData['memberFlow']> = {}
          if (availability === 'not_taking_new') {
            const pending = Object.values(state.relationships).filter(
              (r) => r.palId === profile.personId && r.state === 'pending',
            )
            if (pending.length > 0) {
              relationships = { ...state.relationships }
              for (const rel of pending) {
                relationships[rel.id] = {
                  ...rel,
                  state: 'archived',
                  endedReason: 'declined_by_pal',
                  endedAt: nowIso(),
                }
                // At most one of these is ever the live member's own — the
                // rest belong to whichever other members happen to be
                // seeded against this Pal, and `palOutcome`'s own guard
                // keeps their memberFlow untouched.
                const outcome = palOutcome(rel, 'declined', state.currentMemberId)
                if (outcome) {
                  memberFlowPatch = {
                    ...memberFlowPatch,
                    currentRelationshipId: null,
                    ...backfillAfterDecline(state.memberFlow.shortlist, state.memberFlow.pool, rel.palId),
                    lastOutcome: outcome,
                  }
                }
              }
            }
          }

          return {
            relationships,
            palProfiles: {
              ...state.palProfiles,
              [profile.personId]: {
                ...profile,
                availability,
                // Any deliberate change clears the auto marker: she's
                // driving again, so the "we did this while you were away"
                // framing no longer applies.
                autoNotTakingNewAt: undefined,
                lastActiveAt: nowIso(),
              },
            },
            ...(Object.keys(memberFlowPatch).length > 0
              ? { memberFlow: { ...state.memberFlow, ...memberFlowPatch } }
              : {}),
          }
        }),

      setPalCapacity: (capacity) =>
        set((state) => {
          const profile = state.palProfiles[state.palFlow.palId]
          if (!profile) return {}
          return {
            palProfiles: {
              ...state.palProfiles,
              [profile.personId]: { ...profile, capacity: Math.min(5, Math.max(1, capacity)) },
            },
          }
        }),

      // A setting she lives with, not a one-time onboarding answer — the
      // application step already promises "you can change it any time"
      // (ApplyReplyTime.tsx), so Pal home needs a real way to keep that.
      setPalReplyHours: (hours) =>
        set((state) => {
          const profile = state.palProfiles[state.palFlow.palId]
          if (!profile) return {}
          return {
            palProfiles: {
              ...state.palProfiles,
              [profile.personId]: { ...profile, typicalReplyHours: hours },
            },
          }
        }),

      // Everything she wrote at application time is still hers to revise —
      // "applied info" isn't a one-time snapshot (P8's Edit screen).
      setPalStory: (story) =>
        set((state) => {
          const profile = state.palProfiles[state.palFlow.palId]
          if (!profile) return {}
          return {
            palProfiles: {
              ...state.palProfiles,
              [profile.personId]: { ...profile, story: { ...profile.story, ...story } },
            },
          }
        }),

      acceptPalRequest: (relationshipId) =>
        set((state) => {
          const rel = state.relationships[relationshipId]
          const profile = state.palProfiles[state.palFlow.palId]
          if (!rel || !profile) return {}
          const outcome = palOutcome(rel, 'accepted', state.currentMemberId)
          return {
            relationships: {
              ...state.relationships,
              [relationshipId]: { ...rel, state: 'active' },
            },
            palProfiles: {
              ...state.palProfiles,
              [profile.personId]: {
                ...profile,
                activeCount: profile.activeCount + 1,
                lastActiveAt: nowIso(),
              },
            },
            ...(outcome ? { memberFlow: { ...state.memberFlow, lastOutcome: outcome } } : {}),
          }
        }),

      declinePalRequest: (relationshipId) =>
        set((state) => {
          const rel = state.relationships[relationshipId]
          if (!rel) return {}
          // Private and reasonless by design (workshop §6.5 step 4): nothing
          // is recorded about why, and the member is only ever told about
          // availability, never about a decision made regarding her.
          //
          // `endedReason` is not an exception to that. It records *that* this
          // was a decline, with no why, and exists so `palHistoryFor` can
          // recognise the one case it must never put a badge on. Without it a
          // decline is indistinguishable from her walking away, and the
          // "You talked before" badge would land on a Pal who turned her
          // down — telling her exactly what this promises not to.
          const outcome = palOutcome(rel, 'declined', state.currentMemberId)
          // `outcome` is null whenever this relationship isn't the live
          // member's own (`palOutcome`'s own guard) — this function is
          // reachable from the Pal side for any relationship whoever's
          // playing Pal happens to be declining, not necessarily one
          // belonging to the member persona currently loaded. `memberFlow`
          // (her shortlist, her `currentRelationshipId`) must stay untouched
          // in that case, same as before this edit — only the outcome being
          // real is what makes touching her shortlist safe.
          return {
            relationships: {
              ...state.relationships,
              [relationshipId]: { ...rel, state: 'archived', endedReason: 'declined_by_pal', endedAt: nowIso() },
            },
            ...(outcome
              ? {
                  memberFlow: {
                    ...state.memberFlow,
                    // Symmetric with `simulatePalDeclines`/`findSomeoneElse`
                    // — no longer live, shouldn't keep pointing at an
                    // archived thread.
                    currentRelationshipId: null,
                    // Same one-in-one-out as "Not for me" and
                    // `simulatePalDeclines` — she lands back on M4 to a full
                    // shortlist backfilled from the pool, not a thinned-out
                    // leftover list (see `backfillAfterDecline`).
                    ...backfillAfterDecline(state.memberFlow.shortlist, state.memberFlow.pool, rel.palId),
                    lastOutcome: outcome,
                  },
                }
              : {}),
          }
        }),

      simulateMemberReplies: (relationshipId, body) =>
        set((state) => {
          const rel = state.relationships[relationshipId]
          if (!rel) return {}
          const message: Message = {
            id: newId('msg'),
            senderId: rel.memberId,
            kind: 'text',
            sentAt: nowIso(),
            body: body ?? 'That really helps to hear. Thank you for saying it.',
          }
          return {
            relationships: {
              ...state.relationships,
              [relationshipId]: {
                ...rel,
                state: rel.state === 'quiet' ? 'active' : rel.state,
                messages: [...rel.messages, message],
                lastMessageAt: message.sentAt,
              },
            },
          }
        }),

      simulatePalInactivity: () =>
        set((state) => {
          const profile = state.palProfiles[state.palFlow.palId]
          if (!profile) return {}
          // Auto-switch to "not taking new" at 14 days idle (D5) — so an
          // absent Pal stops being matched into silence, which is the worst
          // outcome for a member. This is the global availability signal,
          // not a conversation pause — her existing threads are untouched.
          return {
            palProfiles: {
              ...state.palProfiles,
              [profile.personId]: {
                ...profile,
                availability: 'not_taking_new',
                autoNotTakingNewAt: nowIso(),
                lastActiveAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              },
            },
          }
        }),

      // Demo control for `PalRequestReminderCard` (§9). Deliberately not
      // modeled on `revivePixelPalReminder`'s force-flag: that card
      // advertises an available feature, so forcing it on is harmless.
      // This card asserts a *specific person* is waiting — forcing it with
      // nothing actually pending would make the product lie. So this
      // restores a real pending request instead: only her own declined
      // (`archived`) relationships are eligible, and only when she has none
      // pending already (otherwise there's nothing to restore — the card
      // is already showing the truth).
      restorePalRequests: () =>
        set((state) => {
          const palId = state.palFlow.palId
          const mine = Object.values(state.relationships).filter((r) => r.palId === palId)
          if (mine.some((r) => r.state === 'pending')) return {}

          const restorable = mine.filter((r) => r.state === 'archived')
          if (restorable.length === 0) return {}

          const relationships = { ...state.relationships }
          for (const r of restorable) relationships[r.id] = { ...r, state: 'pending' }
          return { relationships }
        }),

      // Demo control (§9) for M6's 24h+ still-pending notice — backdates
      // `createdAt` the same way `jumpToState`'s "quiet" target backdates
      // `lastMessageAt`, so the real threshold check in Pending.tsx fires
      // without actually waiting a day. Clears any prior acknowledgement so
      // the notice is guaranteed to show.
      simulateLongWait: (relationshipId) =>
        set((state) => {
          const rel = state.relationships[relationshipId]
          if (!rel || rel.state !== 'pending') return {}
          return {
            relationships: {
              ...state.relationships,
              [relationshipId]: {
                ...rel,
                createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
                waitingAcknowledgedAt: undefined,
              },
            },
          }
        }),

      // Demo control (§9) for the harder of M4's two empty results: nobody
      // at all is available, so there aren't even other-treatment Pals to
      // fall back to. Switches every real Pal to `not_taking_new` (same
      // field `setPalAvailability` uses) and re-runs the real ranking
      // function against her actual latest request, so both the empty
      // shortlist and the empty `broaderPool` are genuine, not hand-set
      // flags.
      //
      // One-way door, deliberately: it leaves every Pal not-taking-new for
      // the rest of the session, so run it last or hit Reset after.
      simulateNoAvailablePals: (memberId) =>
        set((state) => {
          const palProfiles: DemoData['palProfiles'] = {}
          for (const [id, profile] of Object.entries(state.palProfiles)) {
            palProfiles[id] = { ...profile, availability: 'not_taking_new' }
          }
          const request = latestRequestFor(state.memberRequests, memberId)
          if (!request) return { palProfiles }
          const rankable = rankableFrom(palProfiles, state.people, [memberId])
          const ranked = rankAllPals(request, rankable, state.people[memberId]?.age)
          return { palProfiles, memberFlow: { ...state.memberFlow, ...shortlistFields(ranked) } }
        }),

      // Demo control (§9) for the commoner and more interesting miss: Pals
      // are available, just nobody who's been through *her* treatment. It
      // switches only the Pals whose experience actually overlaps her
      // request to `not_taking_new` — so the matched list empties for a real
      // reason while the other-treatment Pals stay genuinely available in
      // `broaderPool`, which is what gives "See other Pals" somewhere to go.
      //
      // Switching availability rather than editing anyone's `experience`: a
      // Pal whose written story is about her FET rounds shouldn't suddenly
      // have no FET tag on her card. Same one-way-door caveat as above.
      simulateNoTreatmentMatch: (memberId) =>
        set((state) => {
          const request = latestRequestFor(state.memberRequests, memberId)
          if (!request) return {}
          const palProfiles: DemoData['palProfiles'] = {}
          for (const [id, profile] of Object.entries(state.palProfiles)) {
            const overlaps = profile.experience.some((t) => request.treatments.includes(t))
            palProfiles[id] = overlaps ? { ...profile, availability: 'not_taking_new' } : profile
          }
          const rankable = rankableFrom(palProfiles, state.people, [memberId])
          const ranked = rankAllPals(request, rankable, state.people[memberId]?.age)
          return { palProfiles, memberFlow: { ...state.memberFlow, ...shortlistFields(ranked) } }
        }),

      // The other half of the M4 empty state: she had suggestions and said
      // "Not for me" to every one of them. Reaching this by hand means ~10
      // taps through the whole ranked pool, so it was effectively
      // undemoable — this drops her straight into the end of that path.
      // Distinct from `simulateNoAvailablePals`: the Pals are still there
      // and still available, she's just seen them all.
      simulateAllSuggestionsDismissed: (memberId) =>
        set((state) => {
          const request = latestRequestFor(state.memberRequests, memberId)
          if (!request) return {}
          const rankable = rankableFrom(state.palProfiles, state.people, [memberId])
          const { broader } = splitByTreatmentMatch(
            rankAllPals(request, rankable, state.people[memberId]?.age),
          )
          return {
            memberFlow: {
              ...state.memberFlow,
              shortlist: [],
              pool: [],
              // Rebuilt rather than left alone so the control works from a
              // cold landing too. If she's already in the broader list,
              // dismissing everything means there's nothing behind it.
              broaderPool: state.memberFlow.broadened ? [] : broader,
              suggestionsExhausted: true,
            },
          }
        }),

      // Demo control (§9) for M4's thin-supply banner ("We found 2 people
      // who are close matches"). With the FET bench seeded (see seed.ts) the
      // matched pool is deep enough that declining backfills normally, which
      // is the point — but it also means this banner is now genuinely hard
      // to reach by hand, and it's still a state worth showing.
      //
      // Same honesty rule as `simulateNoAvailablePals`: it switches real
      // Pals to `not_taking_new` (the field `setPalAvailability` uses) and
      // re-runs the real ranking, so "2 close matches" is a true count of
      // who's actually left, not a number typed into a banner.
      simulateThinSupply: (memberId) =>
        set((state) => {
          const request = latestRequestFor(state.memberRequests, memberId)
          if (!request) return {}
          const rankable = rankableFrom(state.palProfiles, state.people, [memberId])
          const { matched } = splitByTreatmentMatch(
            rankAllPals(request, rankable, state.people[memberId]?.age),
          )
          // Leave exactly two standing — enough that the banner has someone
          // to count, few enough that it fires.
          const keep = new Set(matched.slice(0, 2).map((s) => s.palId))
          const palProfiles = { ...state.palProfiles }
          for (const s of matched) {
            if (keep.has(s.palId)) continue
            const profile = palProfiles[s.palId]
            if (profile) palProfiles[s.palId] = { ...profile, availability: 'not_taking_new' }
          }
          const reranked = rankAllPals(
            request,
            rankableFrom(palProfiles, state.people, [memberId]),
            state.people[memberId]?.age,
          )
          return {
            palProfiles,
            memberFlow: { ...state.memberFlow, ...shortlistFields(reranked) },
          }
        }),

      // "SIMULATE GRADUATION" demo control — see the interface doc comment
      // above for why this is a real transition, not a static screen jump.
      // Two calls, not one `set`: the first seeds Nadia as a genuine active
      // conversation (and gives Jordan's profile the capacity slot that
      // implies, exactly as `acceptPalRequest` would have), the second
      // reuses the real `graduateRelationship` reducer to end it — so
      // everything that reducer does (capacity release, `supportedCount`,
      // the unread closure moment) happens for real, not a copy of its
      // logic maintained separately here.
      simulateNadiaGraduates: (withThankYou) => {
        const relationshipId = 'rel-nadia-jordan'
        const memberId = 'member-nadia'
        set((state) => {
          const palId = state.palFlow.palId
          const profile = state.palProfiles[palId]
          if (!profile) return {}
          const messages = nadiaMessages()
          const seeded: Relationship = {
            id: relationshipId,
            memberId,
            palId,
            state: 'active',
            introNote: messages[0].body,
            messages,
            sharedContext: "You've both been through FET.",
            createdAt: messages[0].sentAt,
            lastMessageAt: messages[messages.length - 1].sentAt,
            milestoneSharing: { enabled: false, items: [] },
          }
          return {
            relationships: { ...state.relationships, [relationshipId]: seeded },
            palProfiles: { ...state.palProfiles, [palId]: { ...profile, activeCount: profile.activeCount + 1 } },
          }
        })
        get().graduateRelationship(relationshipId, { thankYouNote: withThankYou ? NADIA_THANK_YOU : undefined })
      },

      // Demo control (§9) for the "you've met before" badge on M4.
      //
      // Modeled on `restorePalRequests`, not on `revivePixelPalReminder`:
      // that card advertises a feature, so forcing it on is harmless, but
      // this badge asserts a specific shared past with a specific person.
      // A force-flag would make the product claim she talked to Grace when
      // she never did — and the badge links to a conversation that would
      // not be in Past conversations. So this builds the real thing:
      // a real archived relationship, with real messages, ended the real
      // way, followed by the real ranking function.
      //
      // Reaching this state by hand is request → suggestions → say hello →
      // accept → chat → find someone new, which is most of the member
      // journey to set up one badge.
      simulatePreviouslyMetPal: (memberId) =>
        set((state) => {
          const request = latestRequestFor(state.memberRequests, memberId)
          if (!request) return {}

          // Rank first, then pick the top match as the Pal she "met" — so
          // the Pal who comes back wearing the badge is the same one the
          // real matching would have put in front of her anyway.
          const rankable = rankableFrom(state.palProfiles, state.people, [memberId])
          const ranked = rankAllPals(request, rankable, state.people[memberId]?.age)
          const met = ranked[0]
          if (!met) return {}

          const endedAt = nowIso()
          const earlier = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
          const id = newId(`rel-${memberId}-${met.palId}`)
          const palExperience = state.palProfiles[met.palId]?.experience ?? []

          const past: Relationship = {
            id,
            memberId,
            palId: met.palId,
            state: 'archived',
            endedReason: 'found_someone_else',
            endedAt,
            introNote: 'Hi — would love to talk when you have a moment.',
            messages: [
              {
                id: newId('msg'),
                senderId: memberId,
                body: 'Hi — would love to talk when you have a moment.',
                kind: 'text',
                sentAt: earlier,
              },
              {
                id: newId('msg'),
                senderId: met.palId,
                body: "Hi! I'd love to help — tell me more about where you are right now.",
                kind: 'text',
                sentAt: earlier,
              },
            ],
            sharedContext: sharedContextFor(request.treatments, palExperience),
            createdAt: earlier,
            lastMessageAt: earlier,
            milestoneSharing: { enabled: false, items: [] },
          }

          return {
            relationships: { ...state.relationships, [id]: past },
            memberFlow: {
              ...state.memberFlow,
              ...shortlistFields(ranked),
              currentRelationshipId: null,
            },
          }
        }),

      // Demo control (§9) for Pal Home's "Your Impact" card — a client
      // presentation needs to land on "4 completed" in one click, not walk
      // four Requester journeys to graduation first. So this doesn't touch
      // the card's display logic at all: it rewrites the underlying
      // relationship (and, for `'four'`, Person) records via
      // `buildImpactDemo`, and the card keeps deriving its numbers from
      // `relationships` exactly as it always has — see the "Derived rather
      // than stored" note on `PalHome`. That's also why every call rebuilds
      // from `IMPACT_DEMO_RELATIONSHIP_IDS`/`IMPACT_DEMO_PERSON_IDS` rather
      // than layering on the previous selection: switching between options
      // in either direction is always internally consistent, never an
      // accumulation of stray demo relationships.
      //
      // Also applies a Pal profile for her if she hasn't gone through
      // P1–P6 yet, with sensible defaults — the point of this control is
      // "Demo control → 4 completed → Pal Home" in one click, not a detour
      // through the application flow first.
      setPalImpactDemoState: (target) =>
        set((state) => {
          const palId = state.palFlow.palId

          const profile: PalProfile = state.palProfiles[palId] ?? {
            personId: palId,
            story: {
              aboutMe:
                'FET and IVF Pal, glad to be a steady presence for whatever stage you are in.',
              whereIWas: 'A frozen embryo transfer after an earlier cycle that did not take.',
              whatHelpedMe: 'Someone who stayed instead of trying to fix it.',
              whatICanOffer:
                'Company for the parts that are hard to explain to people who have not been through it.',
            },
            experience: ['FET', 'IVF'],
            capacity: 3,
            activeCount: 0,
            availability: 'available',
            typicalReplyHours: 24,
            lastActiveAt: nowIso(),
            supportedCount: 0,
            attestations: { experienceNotAdvice: true, clinicalToCareTeam: true },
            appliedAt: nowIso(),
          }

          const built = buildImpactDemo(target)

          const relationships = { ...state.relationships }
          for (const id of IMPACT_DEMO_RELATIONSHIP_IDS) delete relationships[id]
          for (const rel of built.relationships) relationships[rel.id] = rel

          const people = { ...state.people }
          for (const id of IMPACT_DEMO_PERSON_IDS) delete people[id]
          for (const person of built.people) people[person.id] = person

          return {
            relationships,
            people,
            palProfiles: {
              ...state.palProfiles,
              [palId]: { ...profile, supportedCount: built.supportedCount, lastActiveAt: nowIso() },
            },
          }
        }),

      registerHomeVisit: () => set((state) => ({ homeVisitCount: state.homeVisitCount + 1 })),

      retirePixelPalReminder: () =>
        set((state) =>
          state.pixelPalReminderRetired && !state.pixelPalReminderForced
            ? {}
            : { pixelPalReminderRetired: true, pixelPalReminderForced: false },
        ),

      // Demo control only — lets the client see the reminder again after
      // dismissing it, without a full reset.
      revivePixelPalReminder: () => set({ pixelPalReminderRetired: false, pixelPalReminderForced: true }),

      setMatchOutcomeDemo: (outcome) => set({ matchOutcomeDemo: outcome }),

      beginPixelPalSearch: () => set({ pixelPalSearchActive: true }),
      setMatchAvailabilityDemo: (availability) => set({ matchAvailabilityDemo: availability }),

      endPixelPalMatch: () => set({ pixelPalMatchEnded: true }),
      beginNewPixelPalMatch: () => set({ pixelPalMatchEnded: false }),

      updateSocialProfile: (patch) =>
        set((state) => {
          const person = state.people[state.currentMemberId]
          if (!person) return {}
          return { people: { ...state.people, [state.currentMemberId]: { ...person, ...patch } } }
        }),
    }),
    {
      name: 'pixel-pal-demo',
      // Bumped: Social Profile edit added `signature`/`aboutMe`/`socialLinks`
      // to `Person` and seeded them on Samantha (v9), then dropped `groups`
      // again — group membership isn't part of this profile (v10). Older
      // persisted state reseeds rather than carrying a stale shape forward.
      version: 10,
      // Schema changed mid-build; a real visitor with older persisted state
      // should just reseed quietly rather than see a console error.
      migrate: () => buildInitialState(),
    },
  ),
)
