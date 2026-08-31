// Data model — spec §5. Shared by all three roles (member, Pal, coordinator)
// from day one, per §2's instruction not to model this around the member
// and retrofit later.

export type TreatmentCode =
  | 'IVF'
  | 'IUI'
  | 'FET'
  | 'ICSI'
  | 'OI'
  | 'PGT'
  | 'DONOR_EGG'
  | 'DONOR_SPERM'
  | 'GESTATIONAL_CARRIER'
  | 'EGG_FREEZING'

export type SupportNeed =
  | 'same_treatment'
  | 'emotional_side'
  | 'further_along'
  | 'practical_tips'
  | 'just_listen'
  | 'other'

/**
 * Global matchability, not the state of any one conversation — see
 * `Relationship.state`/`pausedBy` for that. Two values on purpose: a Pal is
 * either reachable by new members or she isn't. There is no global "paused"
 * — stepping away from one conversation (`Relationship.state === 'paused'`)
 * and stepping away from new requests (`not_taking_new`) are different
 * decisions with different scopes, and collapsing them into one switch is
 * exactly the ambiguity this type is meant to rule out.
 */
export type Availability = 'available' | 'not_taking_new'

export type Person = {
  id: string
  displayName: string // real name or alias — user's choice
  usesAlias: boolean
  avatarUrl: string
  kind: 'patient' | 'employee' // employees always show real name
  age?: number
  location?: string
}

export type PalProfile = {
  personId: string
  story: {
    aboutMe: string // a few lines — shown on her card when a member is browsing
    whereIWas: string // "Two failed IVF cycles before our daughter"
    whatHelpedMe: string
    whatICanOffer: string
  }
  experience: TreatmentCode[]
  capacity: number // self-set 1–5 (employees: admin-set, higher)
  activeCount: number
  availability: Availability
  typicalReplyHours: number // her own pick at application — see replyTimeframes.ts
  lastActiveAt: string
  supportedCount: number // impact surface

  // --- Pal journey (workshop doc §6.5) -------------------------------------
  // Optional because the seeded roster predates this application step —
  // backfilling fake attestations onto them would misrepresent it.

  /** Self-attestation (D9) — cheap, creates a record, sets expectations. No
   * "my own treatment is behind me" item — a minimum-distance requirement
   * (B3) was dropped per direct instruction, so a Pal mid-cycle can apply. */
  attestations?: {
    experienceNotAdvice: boolean
    clinicalToCareTeam: boolean
  }
  appliedAt?: string
  /** Set when the 14-day inactivity auto-switch fired (D5), flipping her to
   * `not_taking_new` on her behalf. Distinguishes "she chose this" from "we
   * did this for her" — different copy, because one of those needs to be
   * framed warmly and reversibly, not punitively. This is a global
   * availability signal, unrelated to `Relationship.pausedBy` below, which
   * is about one specific conversation, not her matchability. */
  autoNotTakingNewAt?: string
}

export type MemberRequest = {
  id: string
  memberId: string
  treatments: TreatmentCode[] // prefilled from record, editable
  needs: SupportNeed[]
  note?: string // optional "anything else"
  createdAt: string
}

export type Suggestion = {
  palId: string
  reason: string // REQUIRED — human-readable, e.g. "Also went through two rounds of FET"
  score: number
  // Whether this Pal shares a treatment with what she asked about — the
  // top-priority ranking factor (spec §5), and the line between a real
  // match and a Pal we can only honestly offer as "someone who knows this
  // road." M4 shows the two groups separately rather than mixing them.
  // True by default when she declared no treatment: there's nothing to
  // match on, so nobody is a worse match than anybody else.
  matchesTreatment: boolean
  state: 'offered' | 'chosen' | 'declined' | 'dismissed'
}

export type Relationship = {
  id: string
  memberId: string
  palId: string
  state: 'pending' | 'active' | 'quiet' | 'paused' | 'graduated' | 'archived'
  introNote: string
  messages: Message[]
  sharedContext: string // "You've both been through two FET cycles"
  createdAt: string
  lastMessageAt?: string
  milestoneSharing: { enabled: boolean; items: string[] } // opt-in, granular
  /** Set once she's chosen "Keep waiting" on the 24h+ still-pending notice
   * (M6). Suppresses that notice from reappearing on every visit while she
   * decides — distinct from `autoNotTakingNewAt`'s "we acted" framing: here
   * nothing changed, she just doesn't need to be asked again. */
  waitingAcknowledgedAt?: string

  /**
   * Set only while `state === 'paused'` — a temporary step back from this
   * one conversation, not from matching in general (that's `PalProfile
   * .availability`, a different field entirely). Currently only the Pal
   * side offers this action, so `pausedBy` is always her `personId`, but the
   * field stores an id rather than a boolean so "who can resume this" reads
   * as a fact, not an assumption baked into the UI.
   */
  pausedBy?: string
  /** Her stated intent at the moment she paused — cosmetic beyond driving
   * the optional one-week reminder copy; nothing auto-resumes on it. */
  pauseDuration?: 'one_week' | 'until_ready'
  pausedAt?: string

  /**
   * Why this relationship stopped being live. `state: 'archived'` alone
   * can't say: it covers her leaving a conversation, her withdrawing a
   * request the Pal never answered, and a Pal declining her — three
   * situations that read completely differently if the same Pal is ever
   * suggested to her again (see palHistory.ts).
   *
   * `declined_by_pal` in particular must never reach her as UI copy: a
   * decline is private and reasonless by design (see `declinePalRequest`),
   * and she is only ever told about availability, never about a decision
   * made regarding her. It's recorded so the history badge knows to stay
   * silent, not so it can be shown.
   *
   * `paused` and `graduated` don't need a reason — their `state` already
   * says it unambiguously. `reported` is the odd one out: it isn't a
   * private-decline case (`declined_by_pal`'s reasoning above), it's a
   * safety ending — see the three fields directly below it.
   */
  endedReason?: 'found_someone_else' | 'withdrawn' | 'declined_by_pal' | 'reported'
  endedAt?: string

  /**
   * Set only when `endedReason === 'reported'`: who filed it, the reason
   * they picked, and their optional free-text note. An internal record for
   * admin/back-office review only — never surfaced to either person. The
   * reported person is never told who reported them, why the match ended,
   * that a review is happening, or what was decided; `palHistory.ts`
   * deliberately never turns this into a badge, the same silence it already
   * gives `declined_by_pal`.
   */
  reportedBy?: string
  reportReason?: string
  reportNote?: string

  /**
   * A short excerpt from the Requester's thank-you note, captured at
   * Graduate / wrap up (`PalGraduate`'s "thanks" phase). Shown only to the
   * Pal, only on her own Impact surface — never to the Requester, never
   * public. Absent means no note was left; presence is what promotes this
   * relationship's contribution to Your Impact from an aggregate number to
   * a quoted highlight (see `PalHome`).
   */
  thankYouNote?: string

  /**
   * Set once the Pal has actually opened the one-time Graduation/closure
   * screen for this relationship (`PalGraduationMoment`). While
   * `state === 'graduated'` and this is unset, the relationship carries an
   * *unread* graduation moment — the "New" marker under Pal Home's Wrapped
   * up group and the Pixel Pal update card on her main Home both read this
   * same field, so there is exactly one unread/read state, not two to keep
   * in sync (see `acknowledgeGraduation`).
   *
   * Left unset on purpose when a graduation is Pal-initiated (she tapped
   * "Wrap up together" and is already looking at the closure moment live,
   * via the pre-existing `PalGraduate` flow) — `graduateRelationship`'s
   * `seenByPal` option marks those as already seen at the moment they're
   * created, so she's never asked to "unread" something she was just
   * present for.
   */
  graduationSeenAt?: string
}

export type Message = {
  id: string
  senderId: string
  body: string
  sentAt: string
  kind: 'text' | 'checkin' // checkin = lightweight "thinking of you"
  attachment?: MessageAttachment
}

export type MessageAttachment = {
  type: 'image' | 'document'
  name: string
  /** Data URL for images (in-browser preview); empty for documents, which
   * have no viewer in this prototype — the filename chip is enough. */
  url: string
}

/**
 * Classic app Home dashboard content (Figma node 16785:20785) — clinical,
 * not Pixel-Pal-specific (spec §12 scopes Pixel Pal to peer support only).
 * Keyed per person in `seed.ts` so both Samantha (Requester) and Jordan
 * (Pal) get their own Home, each with content that's actually theirs
 * instead of one hardcoded persona's data appearing under two identities.
 */
export type DashboardContent = {
  dayLabel: string // "Day 12"
  treatmentLabel: string // "of In Vitro Fertilization"
  encouragement: string
  nextDose: { time: string; medication: string; detail: string }
  labTest: { dateTime: string; location: string }
  delivery: { dateTime: string; detail: string }
}
