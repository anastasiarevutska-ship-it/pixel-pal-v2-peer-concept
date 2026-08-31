import type { MemberRequest, PalProfile, Suggestion, TreatmentCode } from './types'

/**
 * Matching rank — spec §5.
 *
 * Priority order: treatment overlap → declared need match → capacity
 * headroom → recent responsiveness → life-stage similarity. Pals who are
 * full or not taking new are excluded before ranking. Every result carries a
 * required human-readable reason.
 *
 * Weights are ordinal, not tuned against real data: each factor's score is
 * scaled well below the factor above it so an earlier factor always
 * dominates ties on a later one, matching the stated priority order.
 */

export type RankablePal = {
  personId: string
  profile: PalProfile
  age?: number
  kind?: 'patient' | 'employee'
}

function hasHeadroom(profile: PalProfile) {
  return profile.availability === 'available' && profile.activeCount < profile.capacity
}

function treatmentOverlap(request: MemberRequest, profile: PalProfile): TreatmentCode[] {
  return request.treatments.filter((t) => profile.experience.includes(t))
}

function needMatchScore(request: MemberRequest, overlap: TreatmentCode[]) {
  let score = 0
  if (request.needs.includes('same_treatment') && overlap.length > 0) score += 1
  if (request.needs.includes('emotional_side')) score += 1 // every story card speaks to this
  if (request.needs.includes('further_along')) score += 1 // refined by life-stage below
  // `whatICanOffer` is practical almost by construction ("What to expect
  // between transfer and testing", "Honest talk about the two-week wait"),
  // so this is as true-by-construction as emotional_side above.
  if (request.needs.includes('practical_tips')) score += 1
  // `just_listen` and `other` deliberately don't score anything — nothing
  // in a Pal's profile can honestly confirm either one, and inventing a
  // signal here would break the "no invented specifics" rule this file
  // otherwise holds to. They still reach the Pal as declared needs; they
  // just don't move the ranking.
  return score
}

function responsivenessScore(profile: PalProfile) {
  // Fewer typical-reply hours is better; invert onto a 0–1 scale (capped at 72h).
  return 1 - Math.min(profile.typicalReplyHours, 72) / 72
}

function lifeStageScore(memberAge: number | undefined, palAge: number | undefined) {
  if (memberAge == null || palAge == null) return 0
  const diff = Math.abs(memberAge - palAge)
  return 1 - Math.min(diff, 20) / 20
}

// Deliberately generic and true-by-construction — no invented specifics
// (a round count, a duration) that the seed data can't actually back up
// for every Pal who happens to share a treatment code. The specific,
// human color belongs in her own story (`whereIWas`), shown right below
// the badge; this line only needs to be honest, not colorful.
const reasonByTreatment: Partial<Record<TreatmentCode, string>> = {
  IVF: 'Also went through IVF',
  IUI: 'Also went through IUI',
  FET: 'Also went through FET',
  ICSI: 'Also went through ICSI',
  OI: 'Also went through ovulation induction',
  PGT: 'Also went through PGT testing',
  DONOR_EGG: 'Also used donor eggs',
  DONOR_SPERM: 'Also used donor sperm',
  GESTATIONAL_CARRIER: 'Also worked with a gestational carrier',
  EGG_FREEZING: 'Also went through egg freezing',
}

function buildReason(
  request: MemberRequest,
  overlap: TreatmentCode[],
  kind: 'patient' | 'employee' | undefined,
): string {
  if (overlap.length > 0) {
    const base = reasonByTreatment[overlap[0]] ?? 'Been through the same treatment as you'
    // A true, available differentiator when several Pals share a code —
    // not fabricated, just a fact we already have.
    return kind === 'employee' ? `${base} — she's part of the Pixel Care team` : base
  }
  if (request.needs.includes('further_along')) {
    return 'Further along in her journey, ready to share what she learned'
  }
  return 'Understands the emotional side of what you’re going through'
}

/** Score every eligible (non-full, non-paused, taking-new) Pal against a
 * request, ranked best-first. */
export function rankAllPals(
  request: MemberRequest,
  pals: RankablePal[],
  memberAge?: number,
): Suggestion[] {
  const eligible = pals.filter((p) => hasHeadroom(p.profile))

  const scored = eligible.map((p) => {
    const overlap = treatmentOverlap(request, p.profile)
    const treatmentScore = overlap.length // 0..N
    const needScore = needMatchScore(request, overlap) // 0..3
    const headroom = p.profile.capacity - p.profile.activeCount // 0..5
    const responsiveness = responsivenessScore(p.profile) // 0..1
    const lifeStage = lifeStageScore(memberAge, p.age) // 0..1

    // Descending-magnitude weights so each factor dominates the one after it.
    const score =
      treatmentScore * 10_000 +
      needScore * 1_000 +
      headroom * 100 +
      responsiveness * 10 +
      lifeStage * 1

    return {
      palId: p.personId,
      reason: buildReason(request, overlap, p.kind),
      score,
      // Nothing declared means nothing to fall short of — see the field's
      // note in types.ts.
      matchesTreatment: request.treatments.length === 0 || overlap.length > 0,
      state: 'offered' as const,
    }
  })

  return scored.sort((a, b) => b.score - a.score)
}

/** Top 3 matches — this is the function named in spec §5. */
export function rankPals(request: MemberRequest, pals: RankablePal[], memberAge?: number): Suggestion[] {
  return rankAllPals(request, pals, memberAge).slice(0, 3)
}

/**
 * The two groups M4 keeps apart: Pals who share a treatment with what she
 * asked about, and available Pals who don't.
 *
 * The second group is *not* a worse version of the first that we quietly
 * pad the list with — mixing them would mean presenting "understands the
 * emotional side" as if it answered "someone who's been through FET," which
 * it doesn't. She only ever sees `broader` after being told plainly that
 * nobody available has been through her treatment, and choosing to look
 * (spec §11.7's "never a dead end", without the dishonesty).
 */
export function splitByTreatmentMatch(ranked: Suggestion[]): {
  matched: Suggestion[]
  broader: Suggestion[]
} {
  return {
    matched: ranked.filter((s) => s.matchesTreatment),
    broader: ranked.filter((s) => !s.matchesTreatment),
  }
}
