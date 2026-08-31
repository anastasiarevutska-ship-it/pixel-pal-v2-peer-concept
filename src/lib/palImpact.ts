import type { Relationship } from './types'

/**
 * The Pal's "Your Impact" numbers, derived from her relationships rather
 * than a stored counter — so it can never drift from what actually
 * happened in the demo. One function, two callers (`PalHome`'s Impact card
 * and `PalGraduationMoment`'s closure screen), on purpose: both surfaces
 * are describing the exact same fact ("you've now been there for N
 * people"), and computing it twice would be two chances for the numbers to
 * quietly disagree the moment either screen's logic changes.
 */
export type PalImpactSummary = {
  /** Relationships this Pal has seen through to graduation. */
  supported: number
  /** Her own messages, summed across every graduated relationship. */
  messagesSent: number
  /**
   * The most recent graduated relationship that carries a thank-you note,
   * if any — the single highlight worth quoting. Never a feed, even with
   * several on record (see `PalHome`'s Impact card docblock).
   */
  highlighted: (Relationship & { thankYouNote: string }) | undefined
}

export function palImpactSummary(
  relationships: Record<string, Relationship>,
  palId: string,
): PalImpactSummary {
  const graduated = Object.values(relationships).filter((r) => r.palId === palId && r.state === 'graduated')

  const supported = graduated.length
  const messagesSent = graduated.reduce(
    (total, r) => total + r.messages.filter((m) => m.senderId === palId).length,
    0,
  )
  const highlighted = graduated
    .filter((r): r is Relationship & { thankYouNote: string } => !!r.thankYouNote)
    .sort((a, b) => (b.lastMessageAt ?? b.createdAt).localeCompare(a.lastMessageAt ?? a.createdAt))[0]

  return { supported, messagesSent, highlighted }
}
