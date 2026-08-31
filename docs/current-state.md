# Pixel Pal Prototype — Current State

**Last updated:** 2026-08-17
**Spec:** [pixel-pal-prototype-spec.md](pixel-pal-prototype-spec.md) · **Design rationale:** [../pixel-pal-redesign-workshop.md](../pixel-pal-redesign-workshop.md)

One-line status: **Phase 1 (Member journey) and Phase 2 (Pal journey) are both built, wired to the same data layer, and click-tested end to end.** Phase 3 (Coordinator) is an honest placeholder. Two real screens have been pulled from Figma and merged in.

---

## 1. Run it

```bash
npm install
npm run dev
```

Open `/` (the launcher) and click **Member** for the receiving side or **Pal** for the giving side — or jump straight to `/m` or `/pal`.

---

## 2. Route map

| Path | Screen | Status |
|---|---|---|
| `/` | Launcher — choose role, Reset demo | Built |
| `/home` | Home dashboard (real Figma pull) + Pixel Pal reminder card | Built — reference/context, plus the one Pixel Pal surface that lives here (§6.1) |
| `/m` | **M1** Contacts entry (real Figma pull, merged with one Pixel Pal card) | Built |
| `/m/pixel-pal` | The Find/Become fork — icon, eyebrow, one-sentence description per side | Built (§6.3) |
| `/m/how-it-works` | **M2** How it works (3 cards, Skip) | Built — no "What brings you here?" fork *after* the cards; that question now has its own screen *before* them (§6.3), and every path into M2 has already answered it |
| `/m/request/needs` | **M3** step 1/2 — what would help | Built |
| `/m/request/note` | **M3** step 2/2 — anything else | Built |
| `/m/suggestions` | **M4** Your suggestions [KEY MOMENT] | Built — the ranked cards, the thin-supply strip (`< 3`), the broadened list (Pals whose treatment is different, labelled as such), and three distinct empty results: no one with her treatment · she's dismissed everyone · nobody available at all. Each empty has its own demo control (§4.1). Cards for a Pal she's genuinely met before carry a "you talked before"-style badge (§6.7) |
| `/m/say-hello` | **M5** Say hello [KEY MOMENT] | Built — reconnecting to a previously-met Pal gets its own prompt set and copy instead of the first-meeting framing (§6.7) |
| `/m/pending` | **M6** Pending (+ decline handling, 24h+ "still waiting?" notice, choose-another-Pal confirm) | Built |
| `/m/chat/:relationshipId` | **M7/M8** Connected + Chat | Built — composer supports image/document attachments via a "+" Add sheet (§6.4) |
| `/m/graduate/:relationshipId` | **M9** Graduate [KEY MOMENT] | Built |
| `/m/past` | Past conversations | Built |
| `/pal` | Router — no profile → apply, profile exists → her Home tab (no admin review, so no in-between status to route through) | Built |
| `/pal/about` | **P1** What this is — time-boxed, honest about the ask | Built |
| `/pal/apply/experience` | **P2** Your experience — defined options, prefilled, "I'm not sure" | Built |
| `/pal/apply/story` | **P3** Your story — three prompts, no blank box | Built |
| `/pal/apply/capacity` | **P4** Your capacity — self-set 1–5, default 3 | Built |
| `/pal/apply/reply-time` | **P4.5** Expected reply time — her own pick, four buckets | Built |
| `/pal/apply/attest` | **P5** Attestation — two items, both required, and the submit step | Built |
| `/pal/status` | **P7** You're a Pixel Pal — instant confirmation, no admin review | Built |
| `/pal/dashboard` | Her Home tab — the shared `PatientDashboard` (§6) with her own clinical seed content, plus the "waiting on you" request reminder styled as a peer of Lab Test/Delivery [KEY MOMENT] | Built |
| `/pal/messages` | Her Messages tab — Care Team block, an inert "Find a Pixel Pal" card, and the real "Pal Home" card into P8 | Built |
| `/pal/home` | **P8** Pal home — requests, conversations, impact, a status summary. Reached as a drill-down from `/pal/messages`, not a landing screen; plain back-button/screen-title header (`ScreenHeader`), no tab bar [KEY MOMENT] | Built |
| `/pal/edit` | Edit your profile — story fields, capacity, reply time, availability | Built |
| `/pal/request/:relationshipId` | **P9** A request arrives — accept / not right now [KEY MOMENT] | Built |
| `/pal/chat/:relationshipId` | **P10** Supporting someone — openers, guidance, care-team handoff | Built |
| `/pal/graduate/:relationshipId` | **P11** Wrapping up — thank-you, wellbeing check, renewal | Built |
| `/bo/*` | Coordinator / Back Office | Placeholder only |
| `/tokens` | Design token reference page | Built (throwaway, spec §3) |

**M3 is 2 steps, not 3.** The original draft's "what you're going through" treatment-chip step was dropped per direct correction during testing: the app already has her treatment record, so asking her to confirm it cold isn't fair. It's pulled in silently (`startMemberFlow`) and surfaces passively later (M4's subtitle, reason badges). See spec §7 for the note.

---

## 3. Data layer

- **Types** — [`src/lib/types.ts`](../src/lib/types.ts), matches spec §5 with one deliberate deviation: `PalProfile` has no `applicationStatus` field. There's no admin review step, so a profile existing in `palProfiles` at all *is* "active" — see below. `story` also gains `aboutMe` (the card blurb, explicitly written rather than derived) in place of the old `signature` field. `Relationship` also carries `waitingAcknowledgedAt` (she's chosen "Keep waiting" on the M6 long-wait notice — suppresses it without changing `state`) and `endedReason`/`endedAt` (why a relationship stopped being live — `found_someone_else` / `withdrawn` / `declined_by_pal` — see §6.7; `declined_by_pal` is recorded but never shown as copy, since a decline stays private by design). `Message` gains an optional `attachment: MessageAttachment` (§6.4).
- **Reply-time buckets** — [`src/lib/replyTimeframes.ts`](../src/lib/replyTimeframes.ts): the canonical four-option list (`Within a couple of hours` / `a day` / `2 days` / `a few days`) a Pal picks from at application time, plus `replyTimeframeLabel(hours)` for displaying any `typicalReplyHours` value back as a phrase. Used by the application picker, the member's suggestion card, and the member's chat header — one function, not three copies of the same bucketing logic.
- **Matching** — [`src/lib/rankPals.ts`](../src/lib/rankPals.ts): `rankPals`/`rankAllPals`, pure functions, priority-weighted (treatment overlap → need match → capacity headroom → responsiveness → life-stage). Every result carries a human-readable `reason` that's honest about what it claims (no invented specifics — see §5 below). `splitByTreatmentMatch` divides a ranked list into Pals who share her treatment and available Pals who don't; **only the first group is ever shown as her suggestions.** The second is offered as an explicit "See other Pals" second look after she's been told nobody available has been through her treatment, and stays labelled as such once opened. Padding the shortlist with non-matches would present "understands the emotional side" as if it answered "someone who's been through FET" — a claim the data doesn't support. When she declared no treatment, everyone counts as a match: nothing to fall short of.
- **Seed** — [`src/lib/seed.ts`](../src/lib/seed.ts): 12 Pals (2 full, 1 paused, 1 not-taking-new, 1 employee, 1 alias), 6 members (Samantha is the Requester-journey protagonist; Jordan is a separate Pal-journey protagonist — see §6.2; Nadia and Jo exist only as counterparties waiting on Jordan), 5 relationships — `active`/`quiet`/`graduated` on the member side, plus two `pending` requests waiting on the Pal. Real written content per spec §6.
- **Store** — [`src/store/useDemoStore.ts`](../src/store/useDemoStore.ts): Zustand + `persist` (localStorage, survives refresh). Holds `people`, `palProfiles`, `memberRequests`, `relationships`, `memberFlow` (Samantha's in-progress draft/shortlist, including `currentRelationshipId` — the "one active Pal" pointer every screen reads instead of re-deriving it), and `palFlow` (Jordan's application draft and `palId`).

Store actions — member: `startMemberFlow`, `setDraftTreatments/Needs/Note`, `submitMemberRequest`, `declineSuggestion`, `restartSuggestions`, `showBroaderPals`, `chooseSuggestion`, `sendIntroNote`, `withdrawRequest`, `sendMessage` (optional attachment arg, §6.4), `setMilestoneSharing`, `pauseRelationship`, `findSomeoneElse`, `graduateRelationship`, `acknowledgeWaiting` (M6 long-wait notice, §6.5), `acknowledgeOutcome` (clears the unseen Pal accept/decline outcome once she's reached the screen that explains it, §6.6).
Pal: `startPalApplication`, `setPalDraftExperience/Story/Capacity/ReplyHours/Attestation`, `submitPalApplication`, `setPalAvailability`, `setPalCapacity`, `setPalReplyHours`, `setPalStory`, `acceptPalRequest`, `declinePalRequest`.
Demo (§9): `resetDemo`, `simulatePalAccepts/Declines/Replies`, `jumpToState`, `simulateMemberReplies`, `simulatePalInactivity`, `simulateLongWait`, `simulateNoAvailablePals`, `simulateNoTreatmentMatch`, `simulateAllSuggestionsDismissed`, `restorePalRequests`, `registerHomeVisit`, `retirePixelPalReminder`, `revivePixelPalReminder`.

Two rules the data layer enforces:

- **A Pal is matchable the instant her profile exists.** No `applicationStatus` gate — `rankableFrom` no longer filters on one, because there's nothing left to filter: submitting *is* becoming active. (Removed after initially shipping a `submitted → in_review → active` gate with a "coordinator approves" demo control — cut per direct instruction, not a bug fix.)
- **`activeCount` falls as well as rises** (`releasePalSlot`, applied on pause, graduate, and find-someone-else). Without it a Pal silently fills up forever and quietly vanishes from every future shortlist. The member is also excluded from her own ranking, since she has a `PalProfile` of her own once she's applied.

---

## 4. Primitives (`src/components/ui/`)

`Button` · `Card` (standard/glass) · `Chip` · `Avatar` · `Tag` · `TextField` · `TextArea` · `Sheet` · `Modal` · `Toast` · `ProgressDots` · `EmptyState` · `PhoneFrame` — all eleven from spec §4.

Shell: `MobileShell` (PhoneFrame + backdrop + demo controls), `TabBar` (real app tab bar, see §6), `RequestStepHeader`, `DemoControls` (§9 panel).

---

## 5. Design tokens — and corrections found along the way

Tokens live in [`tailwind.config.js`](../tailwind.config.js): colors/fontSize/boxShadow/borderRadius are fully replaced (not extended), so no arbitrary value is ever reachable. Spec §3 was a **hand-curated extraction**, not the full system — pulling real screens from Figma surfaced several places where the real file disagreed with that extraction. Corrected in the shared tokens (not just the screen that surfaced them), so every consumer benefits:

| Token | Was (§3 draft) | Now (real Figma) | Found on |
|---|---|---|---|
| `backdrop-blur-glass` | 60px | **30px** | Home screen |
| Glass card fill | flat `bg-white/30` | **`bg-glass-fill`** — diagonal gradient | Home screen |
| `h5` | `16px / 700 / 1.1 / 1px` | **`16px / 700 / 22px / 3px`** | Contact screen eyebrow |
| `card-title` | *(didn't exist)* | **`28px / 700 / 38px / 0`** | Home screen card headings |
| `nav-label` / `nav-label-active` | *(didn't exist)* | **`12px / 400·500 / 1.3 / 0.24px`** | Bottom tab bar |
| `rounded-icon` | *(didn't exist)* | **`8px`** | Small icon-button containers |

One unregistered value seen twice (`#A271F3`, the active-tab purple) is **not** in Figma's own style list — reproduced as the exact exported asset bytes rather than promoted to a new token, since it looks like a one-off, not a system color.

---

## 6. Two screens pulled from Figma

Source file: `yuv1vQ8GyJLitbNh3Qawhl` ("⭐️ NEW Patient App").

- **Home** ([`src/pages/HomeDashboard.tsx`](../src/pages/HomeDashboard.tsx), node `16785:20785`) — the wider Pixel Care dashboard (Day N of treatment, next dose, lab test, delivery). Not part of Pixel Pal's M1–M9; built as reference/context.
- **Contact** ([`src/pages/member/ContactsEntry.tsx`](../src/pages/member/ContactsEntry.tsx), node `16785:21036`) — this **is** M1. Real Care Team communication block (Call/Messages/Video); the "Find a Pixel Pal" card is merged into the empty space below it, per direct instruction.

Deviations from the literal pulls, both deliberate:
- Profile photo → `Avatar` initials, never the stock Unsplash export (spec §6: no stock photos of real people).
- Status bar / home indicator → `PhoneFrame`'s existing chrome, not Figma's own exported status-bar assets (keeps every screen visually consistent).

**`TabBar`** ([`src/components/TabBar.tsx`](../src/components/TabBar.tsx)) is real navigation, not decoration: Home ↔ Messages (`/m`) both work and reflect active state from the actual route. Treatment/Library/Groups are visual only — those sections don't exist here.

Assets are downloaded into `src/assets/home/` and `src/assets/contact/` and committed — never linked to Figma's short-lived export URLs.

### 6.1 Pixel Pal reminder card on Home

[`src/components/PixelPalReminderCard.tsx`](../src/components/PixelPalReminderCard.tsx) — a second entry point into Pixel Pal, in the Home feed alongside the real event cards. It exists for the member who never scrolled to Contacts and so never learned the feature is available to her. **Not from Figma** — an addition, built in the existing Home card language (no new tokens needed: `bg-lavender-20` + `rounded-icon`/`bg-lavender-40` icon box, same `card-title`/`body-bold`/`body` stack as Lab Test and Delivery).

Deliberately *not* an event card — no date, no time, nothing due, no badge or unread dot. It renders **last** in the feed so it never outranks clinical content, and uses the lavender brand tint rather than the glass/yellow treatments the real events use, so it reads as "something available" rather than "something scheduled."

Four rules keep it a reminder rather than a nag:

| Rule | Where |
|---|---|
| Appears only every **3rd** Home visit (`VISIT_INTERVAL`), not every visit | `homeVisitCount` in the store |
| **"Not now" retires it permanently** — dismissal is respected, not snoozed | `retirePixelPalReminder` |
| Visiting Contacts (M1) retires it too — she's seen the real invite there | `ContactsEntry` mount effect |
| Never shown to a member who already has a Pal (`pending`/`active`/`quiet`) | `hasOngoing` check |

The action is the same one M1 uses (`startMemberFlow` → `/m/how-it-works`), so her treatment record is still pulled in silently and never re-asked. Dismissal is as prominent as the action, and both targets are 44px.

**§9 demo control: "Show Pal reminder card"** (Home feed section) un-retires and force-shows it, so the client can see it on demand without a full reset. It's an explicit `pixelPalReminderForced` flag rather than arithmetic on the visit counter — the counter approach silently failed when the control was used while already on `/home`, since no remount happens there. The override deliberately does **not** bypass the "already has a Pal" rule.

---

## 6.2 The Pal journey (`/pal`)

Same base, deliberately: same tokens, same eleven primitives, same `PhoneFrame`/`MobileShell`, same Home and Contacts screens, same `RequestStepHeader` wizard chrome, same chat shape. Only what the Pal flow actually needs is new. Symmetry is a rule of the concept, not a convenience — both sides see the same profile fields, and neither has read receipts or last-seen.

**Its protagonist is Jordan, not Samantha — a deliberate split, revised after initial testing.** The pass-it-forward loop (workshop §5 B1) still means a graduated member is the natural Pal candidate *in the product*: the M9 graduation ask still says "would you do this for someone else?" and still routes to `/pal`, and so does the Contacts card's "Or support someone else" (M2's own fork into this was later removed as redundant — see the route map note above; both remaining entry points still work). What changed is the seed data underneath. The first pass made Samantha literally both — her own `PalProfile`, her own queue (Nadia and Jo, pending on her from the start) — on the theory that one continuous identity makes the concept legible. In practice it did the opposite: Home shows her "Day 12 of In Vitro Fertilization" while `/pal` simultaneously shows her as an active Pal with two people waiting, which just reads as a data-modeling error, not as "graduated member becomes a Pal." A member becoming a Pal is real and stays in the flow; it just no longer needs to be *provably* the same seeded person for the demo to make the point. `Jordan`'s `PalProfile` does not exist until she applies, and that absence *is* the "not a Pal yet" state `/pal` branches on — same mechanic Samantha used to drive, now on a person with no competing Requester-side status to contradict it.

**The two sides are two different people, not just two seeded scenarios.** Jordan's Pal queue is Nadia and Jo; Samantha's member-side history (including her own graduated relationship with Whitney) is untouched and unrelated. `DemoControls` is route-aware for the same reason (a "PAL SIDE" / "MEMBER SIDE" header, and only that side's simulations) — it now also means the two headers never accidentally describe the same person.

### 6.2.1 Jordan gets her own Home and Messages tabs

`palFlow.palId` is always Jordan — she is the only playable Pal in the demo (the twelve seeded Pals in `seed.ts` are counterparties on Samantha's side, matched *to* her, never "you"). So `/pal/*` is one person's app, and she gets the same tab-bar pair the Requester has:

- **`/pal/dashboard`** (Home tab) — the shared [`PatientDashboard`](../src/pages/PatientDashboard.tsx) component `/home` already used, now taking `{ person, content, reminder }` so both sides render through one screen. Jordan's clinical content lives in `dashboards[jordan.id]` (`seed.ts`) — **placeholder values for review**, distinct from Samantha's on purpose (different day, treatment, medication, appointments) so her Home doesn't silently show Samantha's data. `PixelPalReminderCard` there stays a member-only concept; Jordan's slot is [`PalRequestReminderCard`](../src/components/PalRequestReminderCard.tsx), restyled to match the Lab Test/Delivery card language and — unlike the member's card — rendered *first* in the feed and shown on every visit for as long as a request is `pending`, with no dismiss. It exists for exactly the case a request notification gets missed: nothing else on her side would otherwise say anyone is waiting.
- **`/pal/messages`** (Messages tab) — same Contacts (M1) base: [`CareTeamBlock`](../src/components/CareTeamBlock.tsx) (extracted so both screens share it instead of duplicating it), a **Find a Pixel Pal card rendered inert** (a plain non-interactive block, not a button — same honest treatment `TabBar` gives its own unbuilt Treatment/Library/Groups tabs), and a real **Pal Home** card into P8. The member journey (M2–M9) is seeded entirely around Samantha, so wiring "Find a Pixel Pal" here would silently run her shortlist/request data under Jordan's name instead of Jordan's own.
- **`/pal/home` (P8)** moved a level down as a result — reached only from the Messages card, not landed on directly. It dropped the glow/`TabBar` chrome in favor of [`ScreenHeader`](../src/components/ui/ScreenHeader.tsx) (back button + screen title, no tab bar), matching the six sub-page screens it was modeled on (Medication Inventory, Prescriptions, Past Orders, the Community group screens). **`ScreenHeader` and the `screen-title` token were matched from screenshots, not a programmatic Figma pull** — the Figma connector wasn't authorized in that session — unlike every other token/screen in this doc, which came from `get_design_context`/`get_screenshot` against the real file. Worth reverifying if the connector is ever connected. `PalEdit` and `IncomingRequest`'s own ad-hoc back links converged onto `ScreenHeader` too, so there's one header pattern instead of three; `PalAbout` deliberately kept its own (it's an intro/marketing screen — eyebrow, full-sentence heading, lede — not the plain utility pattern `ScreenHeader` covers).
- `TabBar` is fully role-aware now, not just prefix-matched: Home/Messages resolve to `/pal/dashboard`/`/pal/messages` (exact match, since `/pal/home` and its own sub-screens don't carry a tab bar to begin with) while anywhere under `/pal`, and to `/home`/`/m` otherwise.
- `DemoControls`' PAL SIDE panel gained **"Show request reminder"** — restores her seeded Nadia/Jo relationships to `pending` if none currently are (only touches ones she'd previously declined; never touches an active or graduated thread) — plus direct Home/Messages jumps.

What each screen fixes, from the audit:

| Screen | Finding it answers |
|---|---|
| P1 What this is | Open-ended emotional commitment → time-boxed, one person one cycle (§5 B2) |
| P2 Your experience | Twelve unexplained acronyms as a competence test (§2.2B) → every option defined in one sentence, prefilled from her record, "I'm not sure" that doesn't block |
| P3 Your story | Blank "about me" written into a void → three prompts (§5 A2) |
| P4 Your capacity | Cap of 1, set by someone else → self-set 1–5, default 3, soft warning above (D4) |
| P4.5 Reply time | Everyone assumed to reply "within a day" → her own stated pace, feeding the same responsiveness signal `rankPals.ts` already ranks on |
| P5 Attestation | "No medical advice" asserted in a document nobody reads → agreed in her own words (D9, B2); doubles as the submit step — no admin review behind it |
| P7 Status | Application → void (§2.2G) → an instant "You're a Pixel Pal" confirmation, no wait to explain because there's nothing to wait for |
| P8 Pal home | No Pal surface exists at all → requests, "your turn", private impact, auto-pause (D5, D10). Deliberately narrow — everything about *her* (story, capacity, reply time, availability) lives one level down in Edit, reached through a single status card, not inline on the home screen. A member reaching out and the Pal missing the push notification → `PalRequestReminderCard` on her real Home tab (§6.2.1), persistent and non-dismissible, clearing only once she's actually responded — not buried a level down on this screen |
| P9 A request arrives | Matches imposed on both sides (§2.2D) → she decides, informed by the intro note (§5 A3); declining is private and reasonless |
| P10 Supporting someone | Cold start and improvising alone → openers, one-time in-context guidance, care-team handoff (§5 D1/D2, D13) |
| P11 Wrapping up | Volunteer never learns whether she helped → thank-you passed through, wellbeing check (§5 C4), renewal choice |

Two places the copy rules bite hardest here: the member is never told a decision was made about her (only availability), and auto-pause is framed as care rather than punishment — she did nothing wrong, and the failure it prevents (a member matched into silence) is the worst outcome the feature can produce.

---

## 6.3 One card, then a fork

Find and Become briefly lived on Messages as two equally-weighted cards. They were structurally identical — same glass card, same navy icon tile, same full-width navy pill — so the difference was carried entirely by copy the eye skips, and the screen ended up with two competing primary buttons (workshop §2.2A, which the split had argued applied per-card). "Find a Pixel Pal" also appeared twice in the same card, as title and as button.

Now: **one Pixel Pal card on Messages, and the choice gets a screen of its own** ([`PixelPalFork`](../src/pages/member/PixelPalFork.tsx), `/m/pixel-pal`) — `ScreenHeader`, a one-line lede, and two tappable cards each carrying an icon, an eyebrow, a title and one sentence. Receiving and giving are both still first-class; the choice is just no longer something to disambiguate in passing.

**No shared onboarding in front of the fork**, and this was the real decision. Both branches already own one — Find has M2, Become has P1 — and both are written for their own side: two of M2's three cards ("we'll suggest three people", "you choose who feels right") are meaningless to a Pal, so showing them pre-fork means half the audience swipes through content that isn't theirs. A role-neutral screen ahead of the fork would mean rewriting those into something vaguer *and* stacking a fourth explanation in a row. The eyebrow + one sentence per option **is** the onboarding. Order: Messages card (what it is) → fork (which side) → M2/P1 (what it involves), each step adding rather than repeating.

The spec's original "What brings you here?" question is therefore back — but in front of M2, not after it, which is where it always belonged.

| Rule | Where |
|---|---|
| The Messages card is generic **only while she's cold** — a pending request, open thread, or unseen accept/decline turns it into that thread's card, going straight there and skipping the fork | `useOngoingPalEntry` |
| The fork's Find option is state-aware too — browser-back onto it mid-flow is ordinary, and the cold action (`startMemberFlow`) wipes her shortlist | same hook, shared deliberately |
| Mutually exclusive **per surface, not permanently** — nothing locks her out of the other side, since the graduation pass-it-forward ask is spec §0's third protected moment | no gate anywhere; what's gone is only ever being offered both at once |
| Jordan's `/pal/messages` doesn't fork — she's already chosen, so her one card goes straight to Pal home | `PalMessages` |

The Home reminder card (§6.1) still goes straight to M2, not the fork: it's a member-side card that already declares support-seeking intent.

Two things this deleted for free: the inert "Find a Pixel Pal" `<div>`-dressed-as-a-button that used to sit on `/pal/messages`, and the duplicated outcome/ongoing branch that previously lived only in `ContactsEntry`.

---

## 6.4 Chat attachments

Chat composer gains a "+" **Add** button ([`AttachSheet`](../src/components/AttachSheet.tsx)) that replaced the standalone **Check in** button; check-in moved inside the sheet alongside the attachment sources so it isn't lost. Picking an image or document sets a pending attachment (previewed as a removable chip, [`PendingAttachmentChip`](../src/components/MessageAttachmentViews.tsx)) that goes out with the next message; sent attachments render inline via `AttachmentBubble`. Images get a real in-browser preview (data URL); documents have no viewer in this prototype, so a filename chip is the whole affair — deliberately not built further, since there's nothing downstream that reads a document's contents. `+`/input/Send still fit the 366px screen without horizontal scroll.

## 6.5 M6 "Still waiting?" notice

A request sitting at `pending` for 24+ hours (`LONG_WAIT_MS` in [`Pending.tsx`](../src/pages/member/Pending.tsx)) surfaces a calm yellow-40 notice offering **Keep waiting** or **Choose another Pal** — never an auto-cancel, never error framing; the relationship stays `pending` underneath regardless of which she picks. Derived fresh from `relationship.createdAt` on every render, not a running client-side timer, so it's already correct after a reload, a background/resume, or coming back from another screen. "Keep waiting" sets `waitingAcknowledgedAt`, which suppresses the notice without touching `state` — distinct from `autoPausedAt`'s "we acted" framing, since here nothing changed and she just doesn't need to be asked again. "Choose another Pal" opens a confirm modal (her note to the current Pal will be archived, unexplained to the Pal, same as any other archive) before calling `findSomeoneElse` and sending her to fresh suggestions. Demo control: **"25h pending → still waiting?"** (`simulateLongWait`).

## 6.6 Pal accept/decline outcomes surfaced

A Pal declining used to explain itself only on `/m/pending`, and that screen became unreachable the instant it happened — decline nulls `currentRelationshipId`, so the Messages card fell back to the generic "Get started" state and tapping it would wipe her remaining suggestions via `startMemberFlow`. Now `memberFlow.lastOutcome` tracks the last resolved request (declined/accepted) independent of `currentRelationshipId`, with a `seenAt` flag:

- `TabBar` shows an unread dot on Messages (member-only) while the outcome is unseen.
- The Messages card (`ContactsEntry`, via `useOngoingPalEntry`) branches on the outcome instead of silently reverting to cold, in the product's existing never-say-"rejected" voice, routing to Pending's declined branch or the new chat.
- `acknowledgeOutcome()` fires once she's actually reached the screen that explains it (Pending or Chat) — not the moment the outcome is created, so the dot and card get a real chance to be seen. (The demo control's simulate-accept/decline buttons navigate to Home first for the same reason — firing them from `/m/pending` itself used to mark the outcome seen in the same instant it was created.)

## 6.7 Recognizing a previously-met Pal

Leaving a conversation releases the Pal's slot, so she can genuinely be suggested the same Pal again later — nothing about match quality changed. Offering her again is right; offering her *silently* reads as the product forgetting they'd met. [`palHistory.ts`](../src/lib/palHistory.ts) derives the most recent tellable history between her and a Pal from `relationships` (never a second stored copy):

- **Graduated** or **paused** relationships get a plain badge — the `state` already says what happened.
- `endedReason: 'found_someone_else'` → "You talked before" (points at Past conversations).
- `endedReason: 'withdrawn'` → "You reached out before."
- `endedReason: 'declined_by_pal'`, or no `endedReason` recorded at all (legacy data, or a demo-control jump) → **no badge.** A decline is private and reasonless by design; without a recorded reason, the safe default is silence, not a guess that might leak one.

Suggestion cards carrying history show the badge; [`SayHello`](../src/pages/member/SayHello.tsx) gets its own reconnect prompt set and copy ("Tell her what's changed since you last talked" instead of "Tell her where you are right now") so reconnecting doesn't read as a first meeting.

---

## 7. Verified in-browser (not just built)

- Full happy path: M1 → fork → M2 → M3 (2 steps) → M4 → M5 → M6 → simulate accept → M7/M8 chat → Menu → Graduate → pass-it-forward ask.
- The fork (§6.3), both branches and both states: cold Messages card reads "Get started" → fork; Find → M2 with `draftTreatments: ['FET']` still silently prefilled; Become → `/pal` → P1, whose Back now returns to the fork rather than to Messages. After saying hello to Grace, the Messages card becomes "You've said hello to Grace…" / **See your request** and goes to `/m/pending` **without passing through the fork**; deep-linking the fork in that same state shows "Where you left off / See your request" and also lands on `/m/pending` with the 3-Pal shortlist **intact, not wiped**. Jordan's `/pal/messages` shows the Become invite before she applies and a single **Pal Home** card after — the inert button is gone. No console errors; screen `scrollWidth === clientWidth === 366`.
- Decline handling: Pal declines mid-M6 → availability-framed copy, remaining suggestions become actionable, never "declined"/"rejected" in copy.
- M4 empty results, all three, each via its own demo control, walked from a real M3 submission (so the copy names her actual treatment):
  - **"No Pal with her treatment → See other Pals"** (pauses only the FET-experienced Pals) → *"No one available has been through FET"* + **See other Pals** / **Notify me instead**. Taking it opens Dana (IUI), Farrah (EF), Wren (ICSI/IVF) under a subtitle and strip that both say plainly these treatments were different — no one is presented as a match she doesn't have.
  - **"Dismiss every suggestion → seen everyone"** → *"That's everyone who's been through the same as you"* + **See other Pals** / **Show me these again**; with no broader Pals left it falls back to *"That's everyone we found for now"* + a refresh that genuinely repopulates (Grace back at the top).
  - **"No Pals available → no matches"** (pauses everyone) → the informed wait state: coordinator line + **Notify me** / **How Pixel Pal works**, and no "See other Pals", because there's nothing behind it.
  - The three are told apart by `memberFlow.suggestionsExhausted` and `broaderPool.length` — a "See other Pals" button only ever renders where it opens a real list.
- The happy path is unchanged by the treatment-match split: Samantha's FET request still yields exactly three matched cards (Grace, Priya, Elena).
- Find someone else: archives the old thread (still readable in Past Conversations), fresh shortlist generated.
- Pause: one tap, shows up in Past Conversations.
- Jump-to-state + Reset demo (§9 controls).
- Refresh mid-flow: state survives (acceptance criterion §11.9).
- Tab bar round-trip: Home ↔ Messages, active state correct both directions.
- Home reminder card (§6.1): cadence walked visit-by-visit (1 shown · 2 hidden · 3 hidden · 4 shown); "Not now" retires and survives reload; visiting `/m` retires it without ever opening Home; "Find a Pixel Pal" lands on M2 with `draftTreatments: ['FET']` prefilled; demo control force-shows it both from another route and from `/home` itself; suppressed while a relationship is `active` even with the override on. Both targets measured 44px, no horizontal overflow.

Pal journey, walked end to end in the browser:

- Full path: `/pal` → P1 → P2 (IVF added, definitions render) → P3 (about-me + three prompts) → P4 (soft warning appears above 3) → P4.5 (picked "within a couple of hours," `draftReplyHours` → `2`) → P5 (two items now, not three — the "my own treatment is behind me" attestation was dropped per direct instruction, no minimum-distance requirement; Continue stays disabled until both are checked — verified; submitting lands straight on P7, no wait) → P8. Confirmed the stored profile has no `applicationStatus`/`signature`/`whyISupport` field at all.
- P8 → Nadia's request → accept → chat opens with her note; openers fill the composer; sending her first message retires both the openers and the one-time guidance strip; "Member replies" lands.
- Wrap up: thank-you → wellbeing check → renewal. Afterwards capacity is back to 0 of 3, Nadia shows as "Wrapped up", and impact reads "You've seen 1 member through" — i.e. the slot was actually released, not just visually cleared.
- Decline: Jo → "Not right now" → private confirmation → back to Pal home, Jo gone from the queue, nothing recorded about why.
- Auto-pause: demo control → warm banner on Pal home → "I'm back" clears it and the banner does not return.
- Entry points: Contacts' "Or support someone else" now resolves to her Pal home (it routed to a placeholder before). Deep-linking `/pal/home` or `/pal/request/:id` with no application redirects to P1 rather than erroring.
- Member-exclusion rule (§3): a member with her own `PalProfile` never appears in her own shortlist or pool. No longer observable via Samantha in the default seed (she has no `PalProfile` — see §6.2), but the exclusion logic in `rankableFrom` is unchanged and still exercised by Jordan's profile once she's applied.
- Suggestion card and chat header both read the new `story.aboutMe`/`typicalReplyHours` fields correctly (Grace's card shows her `aboutMe` blurb and "usually replies within a day"; Wren's chat header does the same from the seed data) — checked after the admin-review removal to confirm nothing broke downstream of the `PalProfile` shape change.
- No console errors, no server errors, no horizontal overflow (screen `scrollWidth === clientWidth === 366`).

Three real bugs found and fixed during this testing (not just typos — all three changed behavior):
1. M6 Pending → Chat routing gap when a Pal accepted mid-wait.
2. Chat composer overflowed the 366px phone screen (fixed-padding `Button` primitive was too wide for compact icon controls) — caused a real horizontal-scroll rendering artifact, not just a visual nit.
3. Home reminder card flashed on every *off*-cadence visit: visibility was derived from the live `homeVisitCount`, which still held the previous visit's value on first render, so the card mounted and then animated straight back out. Fixed by resolving the visit number once per mount (after the increment) and holding it in local state. The same mount effect is ref-guarded so StrictMode's double-invoke doesn't double-count the cadence.

---

## 8. Out of scope / not built

- **Phase 3 — Coordinator/Back Office** (`/bo`): placeholder only. Health dashboard, exception queue, and Pal roster aren't built. There's no coordinator-side application review to build toward anymore — that step was cut entirely (§3) — but a roster/exception-queue view over already-active Pals is still in scope for Phase 3 whenever it's built.
- Treatment / Library / Groups tabs: visual only, no destination.
- Milestone sharing is member-controlled only: the Pal sees what she's opted into (P10's profile sheet), but there's no Pal-side request-to-share.
- Spec §2 says Phase 2 should "remove the simulated accept". It's kept: Samantha (member) and Jordan (Pal) are different seeded people per direct instruction, so the member's `Pal accepts` control still drives her own flow while Jordan's real accept drives hers.
- Everything spec §12 excludes: auth, real backend, moderation beyond the Report stub, push notifications, community feed, support circles, real PHI.
