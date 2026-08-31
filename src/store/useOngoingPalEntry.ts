import { useDemoStore } from './useDemoStore'

export type OngoingPalEntry = {
  /** Primary action label — always describes the thread, never "Find". */
  label: string
  /** Card body, written about the person she's actually waiting on. */
  body: string
  /** Where the action goes. Never the fork, and never `startMemberFlow`. */
  to: string
  /**
   * True for the three request-status cases — still pending, accepted,
   * declined — false for an ordinary open thread with nothing new to
   * report. Lets a consumer (the Messages card) give the three statuses one
   * shared "something to check" treatment without re-deriving pending vs.
   * unseen-outcome itself.
   */
  isStatusUpdate: boolean
}

/**
 * The member's live Pixel Pal state, or `undefined` when she has nothing in
 * flight.
 *
 * Shared by the Messages card and the fork screen because getting this
 * branch wrong is a real hazard, not a copy nit: the cold-state action calls
 * `startMemberFlow`, which wipes her shortlist. A member who already has a
 * pending request, an open thread, or an unseen accept/decline must never be
 * handed that action — she gets sent to the thread instead, skipping the
 * fork entirely (she's already chosen a side; re-asking would be noise).
 * See `lastOutcome` in the store for where the unseen outcome is set.
 *
 * An unseen outcome outranks an ongoing relationship: a decline nulls
 * `currentRelationshipId`, so without checking the outcome first the screen
 * falls back to cold and looks identical to never having asked.
 */
export function useOngoingPalEntry(): OngoingPalEntry | undefined {
  const people = useDemoStore((s) => s.people)
  const relationships = useDemoStore((s) => s.relationships)
  const currentRelationshipId = useDemoStore((s) => s.memberFlow.currentRelationshipId)
  const lastOutcome = useDemoStore((s) => s.memberFlow.lastOutcome)

  const unseen = lastOutcome && !lastOutcome.seenAt ? lastOutcome : undefined
  if (unseen) {
    const name = people[unseen.palId]?.displayName ?? 'She'
    return unseen.type === 'declined'
      ? {
          label: 'See your suggestions',
          body: `${name} isn’t available for a new connection right now. We’ve kept your other suggestions ready for you.`,
          // The real M4 flow, not Pending's leftover-list branch: her
          // shortlist has already been backfilled to a full 3 (see
          // `backfillAfterDecline`), so this is "up to 3 cards, decline any
          // of them" — the same screen and the same options a fresh search
          // gives her, not a cut-down version of it.
          to: '/m/suggestions',
          isStatusUpdate: true,
        }
      : {
          label: 'Continue chatting',
          body: `${name} said yes! Continue your conversation.`,
          to: `/m/chat/${unseen.relationshipId}`,
          isStatusUpdate: true,
        }
  }

  const rel = currentRelationshipId ? relationships[currentRelationshipId] : undefined
  if (!rel) return undefined

  const name = people[rel.palId]?.displayName ?? 'your Pal'
  if (rel.state === 'pending') {
    return {
      label: 'See your request',
      body: `You’ve said hello to ${name}. We’ll let you know as soon as she replies.`,
      to: '/m/pending',
      isStatusUpdate: true,
    }
  }
  if (rel.state === 'active' || rel.state === 'quiet') {
    return {
      label: 'Continue chatting',
      body: `${name} is your Pixel Pal — pick up where you left off whenever you want to.`,
      to: `/m/chat/${rel.id}`,
      // Not a status to check — an ordinary open thread. Nothing changed
      // since she last saw it, so this shouldn't wear the same "check this"
      // yellow treatment as the three that do (see `isStatusUpdate`).
      isStatusUpdate: false,
    }
  }
  // She paused, not ended — the relationship is still hers, so it stays
  // reachable from here rather than falling through to the cold, generic
  // card below (which would read as "nothing going on," not true). Gets the
  // same yellow "something to check" treatment as pending/accepted/declined
  // — her Pal's status did just change — but never language implying this
  // was her fault or that anything ended.
  if (rel.state === 'paused') {
    return {
      label: 'View conversation',
      body: `${name} is taking a short break. Your conversation is still here — we’ll let you know when she’s back.`,
      to: `/m/chat/${rel.id}`,
      isStatusUpdate: true,
    }
  }
  return undefined
}
