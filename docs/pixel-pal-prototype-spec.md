# Pixel Pal — Prototype Build Spec

**For:** Claude Code
**Goal:** A clickable, near-real prototype the client can fully test, to decide whether to rebuild the real feature.
**Not:** production code. No backend, no auth, no real PHI.

---

## 0. Read this first

Pixel Pal is a peer-support feature in **Pixel Care**, a fertility-treatment patient app. Patients undergoing IVF/IUI/egg freezing are matched with volunteers who have been through the same treatment, for non-clinical emotional support.

**Users are anxious, stressed, and emotionally vulnerable.** Every copy and interaction decision must be warm, calm, and low-cognitive-load. Never clinical, never transactional, never cheerful-corporate.

**What we're changing:** today an administrator manually matches people and the patient waits indefinitely with no information. The new concept gives her **three explained suggestions in seconds**, she **chooses one and writes a note**, and the Pal **accepts**. Both sides consent. Nobody waits.

**The three moments the client must feel:**
1. Request → three suggestions, each with a plain-language reason
2. Write a note → the Pal accepts → chat opens
3. Treatment ends → "would you do this for someone else?"

If a trade-off arises, protect those three.

---

## 1. Tech stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** with the tokens in §3 defined as theme extensions (not arbitrary values)
- **Zustand** for state; **persist** middleware to localStorage so a demo survives refresh
- **React Router** — routes: `/m/*` (mobile), `/bo/*` (back office), `/` (launcher)
- **Framer Motion** for transitions — used sparingly, see §8
- No component library. Build the primitives in §4.

Run with `npm run dev`. Keep it a single repo, no monorepo tooling.

---

## 2. Phasing — build in this order

**Phase 1 — Member (requester) journey. Build this completely first.**
The full path from entry to graduation. The Pal's accept and the graduation ask are driven by **demo controls** (§9) so both "aha" moments work without the Pal app existing.

**Phase 2 — Pal journey.** Real Pal-side screens; remove the simulated accept.

**Phase 3 — Coordinator (Back Office).** Program cockpit.

**Critical:** build the data layer in §5 for all three roles from day one, even though Phase 1 only reads part of it. Do not model it around the member and retrofit later.

---

## 3. Design tokens — extracted from the real Figma design system

Use these exactly. They are the production values.

### Color
```js
navy:      { DEFAULT: '#070F3F', 80: '#383F65', 60: '#6A6F8C', 40: '#9C9FB2', 20: '#CDCFD9' }
lavender:  { DEFAULT: '#C4A6F6', 80: '#D0B8F8', 40: '#E7DBFB', 20: '#F3EDFD' }
coral:     '#FFA07E'
yellow:    { 80: '#FDE9AA', 40: '#FEF4D5' }
white:     '#FFFFFF'
gray20:    '#F9F8F8'
neutral:   { 900: '#101840', 700: '#40455A', 500: '#9095AA' }
```

**Usage:** Navy is primary text and primary buttons. Lavender is the brand accent — surfaces, selected states, highlights. Lavender 20/40 are tints for cards and chips. Coral is a warm secondary accent, used sparingly (never for errors — it reads warm, not alarming). Yellow 40/80 for gentle notices. Gray 20 is the app background.

### Typography — **Space Grotesk** throughout
Load from Google Fonts: weights 400, 500, 700.

| Token | Size | Weight | Line height | Letter spacing |
|---|---|---|---|---|
| Display | 44 | 500 | 1.0 | 0 |
| H3 | 22 | 700 | 1.2 | 0 |
| H4 | 22 | 400 | 1.2 | 0 |
| H5 | 16 | 700 | 1.1 | 1 |
| Body | 16 | 400 | 1.5 | 0 |
| Body Bold | 16 | 700 | 1.5 | 0 |
| Body Small | 13 | 400 | 1.5 | 0 |
| Body Small Bold | 13 | 700 | 1.5 | 0 |
| Captions | 11 | 700 | 1.0 | 1 |
| Label | 10 | 400 | 1.3 | 1 |
| Label Bold | 10 | 700 | 1.3 | 1 |

### Effects
```css
/* Glass card — the app's signature surface, used on home/hero cards */
backdrop-filter: blur(60px);
border: 1px solid rgba(255,255,255,0.6);
box-shadow: -10px 10px 20px rgba(7,15,63,0.05);

/* Small shadow — standard cards */
box-shadow: -4px 4px 12px rgba(7,15,63,0.08);

/* Shadow xs — subtle lift */
box-shadow: 0 1px 2px rgba(16,24,40,0.05);
```

Note the shadows are offset **left and down** (negative X), not centered. Keep that — it's a distinctive part of the existing visual language.

### Shape & spacing
- Radius: 16px cards, 12px inputs/chips, 999px pills and avatars
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48
- Screen padding: 20px horizontal
- Min touch target: 44×44px — **non-negotiable**, WCAG 2.2 AA is the baseline for this product

### If Figma MCP is available
The shared library is **"00. Design System"** (patient app file key `yuv1vQ8GyJLitbNh3Qawhl`). Prefer pulling real component structure over inventing it. Do not block on this — the tokens above are sufficient.

---

## 4. Component primitives

Build these first, in `src/components/ui/`:

`Button` (primary / secondary / ghost / destructive · full-width default on mobile) · `Card` (standard / glass) · `Chip` (selectable, multi and single) · `Avatar` (with initials fallback) · `TextField` / `TextArea` (with prompt-helper slot) · `Sheet` (bottom sheet) · `Modal` · `Toast` · `ProgressDots` (onboarding) · `Tag` (treatment labels) · `EmptyState` · `PhoneFrame` (see §8)

---

## 5. Data model

```ts
type TreatmentCode = 'IVF'|'IUI'|'FET'|'ICSI'|'OI'|'PGT'|'DONOR_EGG'|'DONOR_SPERM'|'GESTATIONAL_CARRIER'|'EGG_FREEZING'

type SupportNeed = 'same_treatment' | 'emotional_side' | 'further_along'

type Availability = 'available' | 'paused' | 'not_taking_new'

type Person = {
  id: string
  displayName: string          // real name or alias — user's choice
  usesAlias: boolean
  avatarUrl: string
  kind: 'patient' | 'employee'  // employees always show real name
  age?: number
  location?: string
}

type PalProfile = {
  personId: string
  story: {                      // replaces the blank "about me"
    whereIWas: string           // "Two failed IVF cycles before our daughter"
    whatHelpedMe: string
    whatICanOffer: string
  }
  signature: string             // short one-liner, existing field
  experience: TreatmentCode[]
  capacity: number              // self-set 1–5 (employees: admin-set, higher)
  activeCount: number
  availability: Availability
  typicalReplyHours: number     // shown as "usually replies within a day"
  lastActiveAt: string
  applicationStatus: 'submitted'|'in_review'|'active'|'declined'
  supportedCount: number        // impact surface
}

type MemberRequest = {
  id: string
  memberId: string
  treatments: TreatmentCode[]   // pulled from her record — not asked in M3 (see §7)
  needs: SupportNeed[]
  note?: string                 // optional "anything else"
  createdAt: string
}

type Suggestion = {
  palId: string
  reason: string                // REQUIRED — human-readable, e.g. "Also went through two rounds of FET"
  score: number
  state: 'offered' | 'chosen' | 'declined' | 'dismissed'
}

type Relationship = {
  id: string
  memberId: string
  palId: string
  state: 'pending'|'active'|'quiet'|'paused'|'graduated'|'archived'
  introNote: string
  messages: Message[]
  sharedContext: string         // "You've both been through two FET cycles"
  createdAt: string
  lastMessageAt?: string
  milestoneSharing: { enabled: boolean; items: string[] }  // opt-in, granular
}

type Message = {
  id: string
  senderId: string
  body: string
  sentAt: string
  kind: 'text' | 'checkin'      // checkin = lightweight "thinking of you"
}
```

**Matching rank** (implement as a pure function, `rankPals`):
treatment overlap → declared need match → capacity headroom → recent responsiveness → life-stage similarity.
Return top 3. **Every result must carry a `reason` string.** Exclude Pals who are full, paused, or not taking new.

---

## 6. Seed data

- **12 Pals** with genuinely varied profiles: different treatments, capacities (1–5), availability states, reply times, and one employee Pal (`kind: 'employee'`, capacity 12, always real name). Include two who are full and one paused — the ranking must visibly exclude them.
- **3 members**, one of whom is the demo protagonist (**Samantha**, matching the existing Figma screens).
- **3 relationships** in different states: one active with ~8 messages, one quiet (25 days silent), one graduated.
- **Written content matters.** Story cards must read like real people wrote them, not lorem ipsum. Specific and human: *"Two failed IVF cycles before our daughter. What helped me was someone who'd normalise how angry I felt."* Generic filler will sink the demo.
- Avatars: use a deterministic placeholder service or local SVG initials on Lavender 40. No stock photos of real people.

---

## 7. Phase 1 — Member journey, screen by screen

### M1 · Contacts entry
Existing Contacts screen shape ("How can we help, Samantha?"), Care Team block above. The Pixel Pal card below has **one primary action: "Find a Pixel Pal"** plus a quiet text link *"Or support someone else →"*.
**Do not** render two competing buttons — that's the bug we're fixing.

### M2 · How it works
Three cards, swipeable, ProgressDots, "Skip" available:
1. *We'll suggest three people who've been where you are*
2. *You choose who feels right and say hello*
3. *They're peers, not medical staff — your care team is always one tap away*

Then the fork: **"I'd like support"** / **"I'd like to support someone"** — different icons, no shared trailing noun.
*(Phase 1: the second option can route to a "coming next" placeholder.)*

### M3 · What would help *(2 short steps, ProgressDots)*
1. **What would help most** — three `SupportNeed` chips, multi-select
2. **Anything else?** — optional TextArea, skippable

**No separate treatment step.** Her treatment record (TR) is pulled in silently from her existing
record — the whole product is already built on TR being known, so re-asking it cold isn't fair to
her. It's never a question in this flow; it surfaces passively later instead (e.g. the suggestions
screen's subtitle and reason badges). *(Revised from the original 3-step draft, which had a
"What you're going through" treatment-chip step first — dropped per client correction during
Phase 1 testing.)*

No blank-page bio anywhere in this flow.

### M4 · Your suggestions **[KEY MOMENT]**
Brief loading state (~1.2s, warm copy: *"Finding people who've been where you are…"*) then three Pal cards.

Each card: avatar, name, `signature`, **reason badge** (Lavender 40 background, prominent — this is the whole idea), treatment tags, availability + typical reply time, and the `whereIWas` line from the story.

Actions: **"Choose her"** (primary) · *See full profile* (opens Sheet with the full three-part story) · *Not for me* (card animates out, replaced by the next-ranked Pal, no reason requested).

**Thin-supply fallback:** if `< 3` results, show what exists with honest copy (*"We found one person who's a close match. More Pals join every week."*) plus notify-me. If `0`, the informed wait state: expected range, *"A coordinator is personally finding your match"*, notification promise, and a link to read Pal stories meanwhile. **Never an empty screen whose only action is cancel.**

### M5 · Say hello **[KEY MOMENT]**
TextArea, 2–3 lines, optional but scaffolded with rotating prompts (*"Tell her where you are right now"* / *"Ask her something you've been wondering"*). Character guidance, not a hard limit. Send.

### M6 · Pending
Calm, not a void: *"[Name] will see your note and get back to you — usually within a day."* Withdraw available.
**She keeps her other two suggestions visible below** — a decline must never return her to zero.

**Decline handling:** framed as availability only — *"[Name] isn't able to take someone new right now. Here are your other suggestions."* Never the word "declined" or "rejected" in member-facing copy.

### M7 · Connected
- Guidelines as **one inline line with a link**, not a full-screen modal
- Shared-context banner at thread top
- Her intro note already present as the first message
- Three opener prompts shown to the recipient

### M8 · Chat
Message list, composer, and:
- Expectation copy in-thread (*"Pals usually reply within a day"*) — **no read receipts, no last-seen**
- Check-in button — sends a lightweight "thinking of you" (`kind: 'checkin'`, renders differently from text)
- Persistent quiet affordance: **"Need a nurse? Talk to your Care Coordinator"**
- Labeled menu (not a bare kebab) containing: View profile · Milestone sharing · Pause · Find someone else · Report
- Milestone sharing: opt-in **per item**, revocable, stage labels only

### M9 · Change or end — three distinct outcomes
- **Pause** — dormant, resumable, nothing lost
- **Find someone else** — straight to a fresh shortlist; conversation **archived and still readable**; the Pal is not told why
- **Graduate** — closing moment: thank-you passed to the Pal, then **the pass-it-forward ask** **[KEY MOMENT]**: *"[Pal] was there for you. Would you do that for someone else?"*

**Nothing is ever deleted.** Archived conversations remain openable from a "Past conversations" list.

---

## 8. Presentation shell

- Route `/` is a launcher: choose Member / Pal / Coordinator, plus "Reset demo".
- Mobile routes render inside a **`PhoneFrame`** — realistic device frame, 390×844, status bar with time, rounded corners, subtle shadow. Centered on a Lavender 20 backdrop. This single component does an enormous amount of work in making the prototype read as "our app."
- Transitions: slide-in for forward navigation, fade for modals, gentle spring on the suggestion cards. **Respect `prefers-reduced-motion`.** No decorative animation beyond this.

---

## 9. Demo controls

A collapsible panel (bottom-right, toggled by a small floating button, hidden by default):

- **Simulate: Pal accepts** — moves the pending relationship to active, drops in a warm first reply. *This is what makes the Phase 1 "aha" work.*
- **Simulate: Pal declines** — exercises the availability-framed fallback
- **Simulate: Pal replies** — appends a message
- **Jump to state:** fresh · pending · active · quiet · graduation
- **Reset demo** — clears localStorage, reseeds

Make it obviously a demo tool (distinct styling), never mistakable for product UI.

---

## 10. Copy rules

- Warm, plain, short. Sentence case. No exclamation marks, no "Oops!", no corporate cheer.
- Active voice; a button's label matches the outcome it produces.
- Never "requester" in UI — she is a **member**. The person supporting is a **Pal**.
- Never "rejected" or "declined" to the member — always availability language.
- Empty states are invitations, not apologies. Errors say what happened and what to do.
- The clinical boundary must be visible but reassuring, never alarming.

---

## 11. Acceptance criteria for Phase 1

1. A first-time user reaches three explained suggestions in **under 60 seconds** without ever seeing an unbounded wait.
2. Every suggestion card shows a specific, human-readable reason.
3. Choosing a Pal requires writing (or skipping) a note, and the note appears in the thread once connected.
4. A simulated decline leaves the member with her remaining suggestions and no dead end.
5. "Find someone else" produces a new shortlist **and** the old conversation remains readable.
6. Graduation shows the thank-you and the pass-it-forward ask.
7. No screen exists whose only available action is cancel or back.
8. Keyboard focus is visible, touch targets ≥44px, contrast passes AA.
9. Refreshing the browser does not lose demo state; Reset restores the seed.

---

## 12. Out of scope

Authentication · real backend or API · moderation tooling beyond a stub (production data shows the report feature is effectively unused) · push notifications · the community/social feed · support circles (a phase-2 concept, pitch only) · any real PHI.
