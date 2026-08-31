import type { Relationship } from './types'

/**
 * "You've met before" — the hint a suggestion card carries when the Pal
 * being offered isn't a stranger.
 *
 * She can genuinely land back on the same Pal: leaving a conversation
 * releases the Pal's slot (`releasePalSlot`), so Grace is eligible for the
 * very next ranking, and `restartSuggestions` / a fresh request never
 * excluded her in the first place. Offering her again is right — nothing
 * about the match quality changed — but offering her *silently* isn't:
 * "Your suggestions" reads as a list of new people, and recognising a face
 * there with no acknowledgement is the moment the product looks like it
 * forgot.
 *
 * This is derived, never stored. The fact already lives in `relationships`;
 * a second copy on `Suggestion` would be one more thing to keep in sync for
 * no gain.
 */

export type PalHistory = {
  relationshipId: string
  /** Badge text on the card — short enough to sit beside the match reason. */
  label: string
  /** One line for the profile sheet, where there's room to say what it means. */
  detail: string
}

/** Live states aren't history. A card for a Pal she's mid-conversation with
 * shouldn't say "you talked before" — that's not a past thing. */
const ENDED_STATES: Relationship['state'][] = ['archived', 'graduated', 'paused']

function endedAtKey(rel: Relationship): string {
  return rel.endedAt ?? rel.lastMessageAt ?? rel.createdAt
}

/**
 * The badge for one ended relationship, or `null` if this one has nothing
 * she can be told.
 *
 * Three cases deliberately return `null`:
 *
 * - `declined_by_pal` — a decline is private and reasonless by design (see
 *   `declinePalRequest`), and she is only ever told about availability,
 *   never about a decision made regarding her. A badge here would leak
 *   exactly that. She still sees the card; it just looks like any other.
 * - `reported` — the strictest case of all (see `reportRelationship` and
 *   `Relationship.reportedBy` in types.ts): whichever side ends up seeing
 *   this Pal's card again is told nothing about a report ever happening.
 * - no `endedReason` at all — persisted state from before the field
 *   existed, or a demo-control jump. Without a recorded reason we can't
 *   rule out that it was a decline, and guessing wrong leaks the one thing
 *   that must not leak. Silence is the safe default, not the lossy one.
 */
function badgeFor(rel: Relationship): Omit<PalHistory, 'relationshipId'> | null {
  if (rel.state === 'graduated') {
    return {
      label: 'You graduated together',
      detail: 'You saw a conversation with her through to the end before.',
    }
  }
  if (rel.state === 'paused') {
    return {
      label: 'Paused conversation',
      detail: 'Your earlier conversation with her is paused, not ended — it’s still in Messages.',
    }
  }
  if (rel.endedReason === 'found_someone_else') {
    return {
      label: 'You talked before',
      detail: 'You’ve talked with her before. That conversation is still in Past conversations.',
    }
  }
  if (rel.endedReason === 'withdrawn') {
    return {
      label: 'You reached out before',
      detail: 'You sent her a note before but withdrew the request before she replied.',
    }
  }
  return null
}

/**
 * The most recent tellable history between this member and this Pal, or
 * `null` if they have none — or none she can be told about.
 *
 * Most-recent-first rather than first-found: if she left Grace in March and
 * again in July, "you talked before" should describe July. And skipping
 * past an untellable one to an older tellable one is intentional, not a
 * leak — "you talked before" stays true, and says nothing about the decline
 * sitting in front of it.
 */
export function palHistoryFor(
  relationships: Record<string, Relationship>,
  memberId: string,
  palId: string,
): PalHistory | null {
  const ended = Object.values(relationships)
    .filter((r) => r.memberId === memberId && r.palId === palId && ENDED_STATES.includes(r.state))
    .sort((a, b) => endedAtKey(b).localeCompare(endedAtKey(a)))

  for (const rel of ended) {
    const badge = badgeFor(rel)
    if (badge) return { relationshipId: rel.id, ...badge }
  }
  return null
}
