# Pixel Pal Redesign — Workshop Doc

**Status:** Draft in progress
**Purpose:** Working document for the Pixel Pal concept redesign. Will grow through: as-is analysis → gaps/weak points → open questions → decisions → new concept → prototype spec (for Claude Code build).

---

# 1. As-Is Analysis

## 1.1 What the feature is, today

Pixel Pal is a peer-support matching feature inside Pixel Care (patient mobile app), moderated from Back Office (web). It connects a patient currently in treatment ("Requester") with someone who has treatment experience ("Pal") for informal, non-clinical 1:1 chat support. It is explicitly positioned as separate from Care Coordinators (clinical, nurse-staffed) and Private Messages (general community DMs) — same Contacts screen, three distinct cards/entry points, three distinct unread counters.

## 1.2 Roles, as they exist today

| Role | Who | How they enter | Current limits |
|---|---|---|---|
| **Requester** | Patient wanting support | "Request a Pixel Pal" flow: intro screen → self-intro/bio → waiting state | Max **1** active Pal at a time |
| **Patient Pixel Pal** | Former/current patient volunteering to support others | "Become a Pixel Pal" flow: intro → treatment-experience checklist → bio | Max **1** active Requester; no formal verification (admin can reject manually, no criteria defined) |
| **Back Office (employee) Pixel Pal** | Pixel staff member | Enabled via a dedicated **"Pixel Pal" tab on their Admin Panel user profile** (sibling to "Basic Information" and "Roles & Permissions"). An admin fills in the same profile shape a patient Pal self-declares — Signature, "About Me" bio, and the identical treatment-experience checkbox set — plus an "Assigned Patients" table (name, date assigned, last activity, row action). So the profile content is **similar to the patient-Pal path**; the real difference is *who* fills it in (admin, not the employee themselves) and that there's no self-serve onboarding step at all | **Admin-configurable per employee** via a plain "Max. Number of Patients" number field (example shown: 12) — **not a fixed 25**; ~25 in the discovery doc was likely just an observed real-world value across current employee Pals, not a hard system limit |
| **Administrator / Coordinator** | Back Office staff | N/A | Reviews applications, manually matches, moderates, enables employee Pals |

**Population today:** ~2 employee Pals, ~120–150 patient Pals, all in one undifferentiated list.

## 1.3 Mobile app (Pixel Care) — current flows

**Entry points:** Home-screen "Meet your Pixel Pal" widget (once matched) + a Pixel Pal section on the Contacts tab. The first-timer entry point (no Pal, no pending request) **is confirmed** on the Contacts screen ("How can we help, Samantha?"): below the Care Team contact options sits a dedicated Pixel Pal card — one paragraph of intro copy ("Get matched with a Pixel community member who understands what you're going through — because they've experienced it, too") followed by **two stacked buttons of near-equal visual weight**: a filled "Request a Pixel Pal" and an outlined "Become a Pixel Pal." There's no differentiating question or guidance between them — just two doors under one generic paragraph. This is a direct visual source of the "Become vs. Request confusion" pain point already flagged in the discovery doc (users wanting support tap "Become," users wanting to mentor tap "Request") — the screen itself doesn't help the user figure out which role they are before choosing.

**Become a Pixel Pal:**
1. Intro screen (role explanation, "not a medical professional" disclaimer)
2. Treatment-experience checklist (multi-select: IVF, ICSI, FET, Donor egg/sperm, Surrogacy, IUI, OI, ART, GIFT, ZIFT, Embryo Cryopreservation, Other/free text) — this is the sole matching key
3. Self-intro/bio (free text)
4. Match-found notification (shows requester's photo, name, experience, bio + CTA to chat)

**Request a Pixel Pal:**
1. Intro screen (matching logic explained, sets expectation of reply delays)
2. Self-intro/bio (free text)
3. Waiting state (cancelable)
4. Match found → drops into chat / home widget

**Onboarding gate:** First entry into a match triggers a mandatory Community Guidelines modal (also accessible anytime from profile).

**Chat:** Standard 1:1 ChatView, kebab menu → action sheet → End conversation / Report.

**Ending a conversation** (requester-initiated, no wrongdoing):
1. Reason (radio): "No longer need a Pal" / "Doesn't feel like a good match" / "Other" + warning that chat history will be lost
2. *[Inconsistently present]* Feedback step: what you liked / disliked + 3-card rating (no numeric/label anchors, unlike the app's own NPS precedent)
3. Rematch prompt (Yes/No) → loops back into Request flow if yes

**Reporting a Pal** (trust & safety path, more serious):
1. Reason (multi-select, fixed checkboxes, no free-text "other"): inappropriate language, personal attack/harassment, misinformation about treatment/health, self-promotion, off-topic, other
2. Confirmation: "Your Pal won't know you reported them"
3. Resolution screen: "You'll be notified once resolved" + same rematch CTA

**Known version drift:** an older Lorem-Ipsum-era flow with a Privacy Policy checkbox and a "Refuse Pixel Pal" mechanism (different reasons than the current Report flow) still exists in the Figma file alongside the newer flow. Unclear which is authoritative.

## 1.4 Back Office — current flows

**Location:** Community → "Pixel Pal" tab (siblings: Subject Matter, Moderation).

**Layout:** three-pane console — Patients queue (left) | Pixel Pals roster (center) | Detail side panel (right, split Patient/Pal slots).

**Patient card:** badge "Patient," NEW indicator, avatar/name/request date, one treatment-cycle tag. Kebab → **"Convert to Pixel Pal"** (admin can promote a requester straight to Pal status, bypassing the mobile opt-in/checklist entirely).

**Pixel Pal card:** badge "PIXEL User" (or still "Patient" if pending approval — implies pending and approved Pals coexist in the same list), avatar/name, **capacity ratio** (e.g. `0/1`, `2/24`, `12/12`) shown in red at zero active matches / grey otherwise, "Last activity" timestamp, treatment-experience tags (+N overflow with hover tooltip), unexplained colored left-edge bar. Kebab → **"Cancel Pal request."**

**Side panel:** populates on card selection; shows demographics + full treatment-cycle experience; blocks assignment with an inline error if the selected Pal is at capacity. **Primary action: "Assign."** Success toast on confirmation.

**Core workflow (manual matching):** admin selects a Patient card → selects a Pal card → clicks Assign → blocked if at capacity → success toast. This is the entire matching mechanism — no algorithmic suggestion, no sort/filter/priority tooling on either queue.

**Managing existing matches:** "Assigned Patients" popup per Pal (table: name, date assigned, last activity, row action — presumably unassign) and a separate "Remove Patient?" confirmation for unassigning one relationship without affecting the Pal's other matches.

## 1.5 Moderation, as it exists

Corrected from an earlier draft of this section: a moderation dashboard **does** exist in Back Office (Figma: "Moderation Dashboard / Pixel Pal," under Community's standard sidebar/header chrome). It's a reports queue, not the Pixel-Pal-specific console documented in Section 1.4 — likely shared across Community's message/post reporting generally, with a "Pixel Pal" tab/scope alongside others.

**Structure:** a row of "Flagged Card" entries, each showing reporting user, reported user, reported content (a message or a post, with type), the reason given, timestamps for both the original content and the report itself, and — for post-based reports — an expandable thread ("See Comment (+N replies)" / "See Post (+N comments)") so a moderator can see surrounding context, not just the flagged line in isolation.

**Actions available:**
- **Dismiss** — "Dismiss this issue? Would you like to dismiss this issue taking no action?" — closes the report with no consequence to the reported user.
- **Delete content** — "Message Deletion — You are about to delete [Name]'s message: [content]" with a required **Deletion Reason** text field, logged.
- A **Resolved** state/tab exists (empty-state copy: "There are no resolved items yet"), implying reports move from an active queue into a resolved log once actioned.

**What's still not visible:** any escalation path beyond dismiss/delete (e.g. warnings, suspensions, repeat-offense tracking), and no confirmed link showing this dashboard is what the mobile "you will receive a notification once the case has been resolved by our team" promise actually fires from.

**Priority note (client-provided production data):** the Report feature is essentially unused in production — reports are rare to non-existent in practice. This means the redesign should **not** invest heavily in reinventing moderation UX; it's a low-priority area relative to matching, roles, and capacity. Carry existing functionality forward roughly as-is rather than spending workshop time on it, unless real usage data changes.

## 1.6 Data model / terminology, as it stands

- **"Pixel Pal" is simultaneously: the feature name, the mentor role, and (colloquially) sometimes the requester.
- The Pixel Pal "self-intro/bio" component is **not bespoke** — it's the same general **patient social profile** used elsewhere in Community, made of four fields: **(1) profile image, (2) alias** (optional pseudonym, for patients who don't want to use their real name), **(3) signature** (short free-text statement), **(4) about me** (longer free text). The Back Office employee-Pal profile mirrors two of these (signature, about me) but does not appear to have an alias field — employees are presumably always shown under their real name/photo.
- **Decided:** identity display is **patient's choice** — real name or alias, same as elsewhere in Community. **Employees always show their real name** (no alias option), consistent with them having no alias field in their Back Office profile. Carry this into the concept as a confirmed rule, not an open question.
- Treatment taxonomy differs slightly between mobile checklist and Back Office cards (e.g. "Gestational Carrier," "Egg Freezing" appear in Back Office but not the mobile checklist).
- Capacity is a raw integer ratio (`x/y`) with no stated source of truth for how `y` (max capacity) is set — global default vs. per-Pal vs. self-reported is unknown.
- "Last activity" is captured but not used for sorting, prioritization, or any decision support.

## 1.7 End-to-end journeys today

**Requester journey:** Open app → Request a Pal → write bio → wait (unbounded, no visibility into queue position or expected wait) → admin manually matches → chat opens → guidelines gate → converse → (eventually) end conversation → optional feedback → optional rematch (restarts the wait).

**Patient-Pal journey:** Open app → Become a Pal → checklist + bio → application appears in Back Office → admin reviews (no defined criteria) → approved (implicitly, no visible explicit approval step beyond not being rejected) → available for matching → admin assigns a Requester → chat opens → converse → conversation ends (unclear if Pal-initiated ending is symmetric to Requester-initiated) → available for next match, still capped at 1.

**Employee-Pal journey:** Admin enables the role on an employee's profile → immediately available for matching, no application, no profile, no experience/bio data → same Back Office roster and Assign mechanism, just a much higher capacity ceiling (~25) with no visible reasoning for that number.

**Administrator journey:** Monitor two flat lists → manually cross-reference treatment tags and remaining capacity by eye → assign one pair at a time → handle "Convert to Pixel Pal" and "Cancel Pal request" edge actions → (moderation actions undocumented/unknown).

## 1.8 Flagged during review (carry into Section 3 — Open Questions)

- **"Convert to Pixel Pal" decision criteria are undocumented.** No visible workflow, checklist, or system prompt informs *when* or *why* an admin promotes a Requester straight to Pal status. Most likely this happens off-system — e.g. a Care Coordinator or admin recognizing a good candidate through personal communication with the patient — rather than any defined in-product criteria. Needs client input: is this meant to stay an informal judgment call, or should it become a structured path?
- **Employee-Pal capacity is admin-set per person**, not a fixed global cap — confirmed via the Admin Panel profile screen. This changes how we think about the "1 vs. ~25" cliff in the redesign: it's really "self-declared/low-touch (patient) vs. admin-declared/configurable (employee)," which is a more tractable gap to unify than a hardcoded number difference.
- **Match-found notification content is asymmetric and unfinished on one side.** On the "Become a Pixel Pal" match, the notification shows the requester's full "Experience: [treatment list]" plus "About me." On the "Request a Pixel Pal" match, the equivalent second field is literal placeholder text in the file — *"Additional info — Here should be info that was provided during a request flow"* — rather than actual content. This reads as unfinished spec work left in the design file, not an intentional asymmetry; the requester should presumably see the Pal's treatment experience too.
- **Rating step interaction confirmed:** the "How would you rate this experience?" step (end-of-conversation flow) uses 3 illustrated cards where the selected option visibly enlarges relative to the other two — no numeric or text label anchors, consistent with the existing note that this breaks from the app's own NPS labeling precedent.

---

# 2. UX Audit — Patient Perspective (Requester + Pal)

**Persona:** Patient, both roles.
**JTBD:** *"I should clearly understand how this service works, how to apply to it, and what to expect."*
**Lenses:** friction/cognitive load · Nielsen heuristics · emotional & behavioral drop-off.

## 2.1 Executive Summary

Pixel Pal is a well-intentioned feature whose interaction design systematically withholds the three things its JTBD demands: it never explains how the service works end-to-end, it makes the choice of *how to apply* a coin flip between two near-identical buttons, and it sets essentially no expectations about what happens next. The primary bottleneck is the **unbounded, information-free waiting state** created by manual matching — a screen shown to a clinically anxious user that communicates nothing, offers no agency except cancellation, and has no stated endpoint. Secondarily, the entire supporter (Pal) side of the product is effectively unowned: a Pal applies, disappears into a void, and is later assigned a human being with no ability to accept, decline, pace, or pause.

## 2.2 Critical Friction Points

### A. Entry & role selection — Contacts screen

- **Two doors, one description, no guidance.** The card shows a single paragraph — *"Get matched with a Pixel community member who understands what you're going through — because they've experienced it, too"* — followed by "Request a Pixel Pal" (filled) and "Become a Pixel Pal" (outlined). That paragraph describes **only the requester value proposition**. A user who wants to *give* support is shown copy about *receiving* it, then expected to self-identify into an unexplained second button. **Fails Nielsen #6 (recognition over recall)** — the user must already know the product model to choose correctly.
- **The two labels are lexically near-identical.** "Request a Pixel Pal" / "Become a Pixel Pal" — same length, same structure, same three trailing words, differing only in a leading verb. Under stress, scanning at speed, this is a coin flip. This is the confirmed root cause of the documented pain point where users applying for support instead apply to become mentors and vice versa, requiring manual admin correction.
- **Screen framing contradicts one of the two audiences.** The parent screen asks *"How can we help, Samantha?"* and is populated with Care Team contact options. A prospective mentor arrives inside a help-seeking context to volunteer. The information architecture places a giving action inside a receiving frame.
- **The visual hierarchy makes an implicit recommendation nobody intended.** Filled vs. outlined button styling reads as primary/secondary — i.e. "Request" is the default, "Become" is the lesser option. If mentor supply is the actual constraint on this feature (it is: ~120–150 patient Pals capped at 1 assignment each), the UI is actively de-emphasizing the side of the marketplace that needs growth.

### B. Onboarding — checklist & bio

- **Twelve unexplained medical acronyms.** The treatment-experience checklist (IVF, ICSI, FET, IUI, OI, ART, GIFT, ZIFT, Embryo Cryopreservation, Donor egg/sperm, Surrogacy) is presented with no definitions, no examples, and no "I'm not sure" escape. **Fails Nielsen #2 (match between system and real world).** "ART" is a category that contains several of the other items; GIFT and ZIFT are rarely performed. Patients frequently do not know the formal acronym for the protocol they are personally undergoing. Asking a stressed user to self-classify medically, unaided, as a *gate to helping others*, is a needless competence test.
- **Matching data is collected asymmetrically.** The Pal self-declares a rich multi-select of experience; the Requester declares nothing — Back Office derives a single treatment tag from their record. The feature's only matching key is therefore rich on one side and one-dimensional on the other, and the requester has no way to say what she actually wants support *with* (e.g. "second failed cycle," "deciding about donor eggs") as opposed to what procedure she's on.
- **The bio is written blind, into a void.** Both flows ask for free-text self-introduction *before* the user has seen a single example of what a Pixel Pal profile looks like, or who will read it. A blank required text field addressed to an unknown audience is the highest-friction input in any product. The Become flow at least offers "Not sure where to start?" prompts; the Request flow does not consistently — so the *more vulnerable* user gets *less* scaffolding.

### C. The waiting state — the single biggest failure

- **Zero visibility of system status.** After submitting a request, the patient sees a waiting screen with no queue position, no estimated wait, no explanation that a human being is doing the matching, and no notification of progress. **Fails Nielsen #1 outright.** Behind the screen, an administrator is manually cross-referencing two unsorted lists by eye — so the true wait is unbounded and invisible.
- **Cancellation is the only available agency.** The only interactive affordance on the waiting screen is "cancel request." When the sole action a frustrated user can take is to abandon, abandonment becomes the measured behavior. This is a drop-off funnel by construction.
- **Silence is interpreted personally.** For this persona — anxious, outcome-pressured, already waiting on clinical results elsewhere — an unexplained wait for a *peer support* match is easily read as "nobody wanted to be matched with me." Nothing in the UI prevents that interpretation.

### D. The match moment

- **The requester receives less information than she gives.** The match-found notification on the Become side displays the counterpart's full treatment experience plus bio. On the Request side, the equivalent field is unfinished placeholder copy in the design file ("Here should be info that was provided during a request flow"). The person in the more vulnerable position is shown *less* about the stranger she's about to confide in. Trust asymmetry, precisely at the moment trust is being established.
- **Neither party can accept or decline.** A match is imposed on both sides. There is no "not right now," no preview-then-confirm. The only exits are ghosting or the destructive End Conversation flow. **Fails Nielsen #3 (user control and freedom).**
- **A legal document is placed on the critical path at the emotional peak.** The Community Guidelines modal interrupts precisely at match-found — the one genuinely rewarding moment in the flow — and gates it behind a full-screen legal document *last updated 4.6.2022*. Visibly stale legal copy in a HIPAA-adjacent product signals neglect. Nobody reads it; it functions as compliance theater that taxes the payoff moment.

### E. The chat

- **No expectation-setting survives past the intro screen.** "Please allow for delays in replies" appears once, during onboarding, and never again. In the chat itself there is no last-seen, no typical-response-time, no "your Pal usually replies within a day," no indication the Pal is even still active. Silence after a vulnerable first message is the highest-anxiety state this feature can produce, and the UI does nothing to buffer it.
- **Cold-start problem is unaddressed.** Two strangers, a blank thread, and a subject matter that is genuinely hard to open. Conversation-starter prompts exist only in the bio-writing step, where they help the wrong task. There are no openers, no shared-context surfacing ("you've both been through FET"), nothing.
- **All conversation management is hidden behind a kebab.** End, report, and profile actions live in an action sheet behind an unlabeled icon. Defensible for destructive actions, but it also means the *safety* affordance (report/block) is the least discoverable element in a feature whose entire premise is putting a vulnerable patient in a private room with a stranger.

### F. Ending a relationship

- **Irreversible data destruction, delivered as a footnote.** *"Note: if you close this conversation, your chat history will no longer be available"* appears as a warning line under a radio list — not as a confirmation gate, not with an undo, not with an archive option. **Fails Nielsen #5 (error prevention) and #3 (undo/redo).**
- **Two opposite intents produce the same destructive outcome.** "I no longer need a Pixel Pal" (I'm done with the service) and "Doesn't feel like a good match" (I want a *different* person) are routed to identical consequences: everything is deleted. The user seeking a better match is punished with total loss and a return to the unbounded queue.
- **The rating step is inconsistent and unanchored.** It appears in some end-conversation variants and not others, and uses three illustrated cards with no numeric or text labels — while the same app has an established, deliberately-anchored NPS rating pattern. Two rating paradigms in one product, and the vaguer one is used for the more emotionally loaded event.

### G. The Pal (supporter) experience — structurally unowned

- **Application → void.** After submitting the checklist and bio, the Pal receives no confirmation of review status, no "you're in the pool," no estimate, no visibility. Approval is implicit (defined by *not* being rejected). The next thing that happens, at an unpredictable time, is that a human is assigned to them via popup.
- **No capacity, pacing, or availability control.** The Pal cannot set how many people she can support, cannot pause during a hard week, cannot go temporarily unavailable, and cannot decline an assignment. Meanwhile a Back Office employee's capacity *is* configurable — by an admin, in a field the patient-Pal has no equivalent of. The volunteer has strictly less control over her own labor than the paid staffer.
- **Capacity of 1 makes most of the supply pool invisible.** With ~120–150 patient Pals capped at a single assignment, the mentor pool is structurally tiny — and the Pal herself has no idea whether she's active, idle, matched, or effectively shelved.
- **No feedback, recognition, or closure.** The Pal never learns whether she helped. The post-conversation survey is collected *from the requester* and surfaced to *nobody*. There is no impact reflection ("you supported 4 people through IVF"), no thanks, no completion state. For a purely volunteer role, the product provides zero reinforcement loop — which is very likely why mentor motivation is documented as an open unknown: the product has never given mentors a reason to come back.
- **Role identity is never named in the UI.** A person can be a requester now and a Pal later. Nothing in the interface tells you which you currently are, what you've agreed to, or how to change it.

### H. Terminology (cross-cutting)

"Pixel Pal" simultaneously denotes the feature, the supporter role, and — in some surfaces — the requester. Users cannot form a stable mental model of a system whose central noun refers to three different things, and the two primary CTAs both end in that same ambiguous noun. This is not a copy nitpick; it is the reason the entry screen's two buttons are indistinguishable.

## 2.3 Quick Wins

1. **Rewrite the entry screen as a question, not two buttons.** Replace the shared paragraph + twin CTAs with an explicit fork: *"I'd like support"* / *"I'd like to support someone."* Different verbs, different first words, different icons. Removes the coin flip and eliminates the admin correction work.
2. **Add a "How it works" 1-2-3 before either CTA.** Three lines: how you're matched, roughly how long it takes, what the chat is (and isn't). Directly serves the JTBD; costs one component.
3. **Put expected wait time on the waiting screen.** Even a coarse honest range ("most matches are made within 2–3 days") converts an anxiety void into a manageable expectation. Pair it with "a member of our team is personally finding your match" — the manual process is a *feature* if you say it out loud.
4. **Fix the asymmetric match notification.** Show the requester the Pal's treatment experience, exactly as the Pal sees hers. This is finishing an unfinished screen, not new design.
5. **Move the Community Guidelines gate off the match moment** to the end of onboarding (before the wait, when the user has idle time anyway) and refresh its 2022 date.
6. **Add definitions/examples to the treatment checklist** (inline helper text or a tap-to-expand) and add an "I'm not sure" option.
7. **Split "Doesn't feel like a good match" from "I no longer need support."** Route the former to rematch *without* destroying history; only the latter fully closes.
8. **Add "Not sure where to start?" prompts to the Requester bio step**, reusing the component that already exists in the Become flow.

## 2.4 Strategic Recommendations

1. **Treat this as a two-sided marketplace and build the missing side.** The Pal needs a real home: application status, availability toggle, self-set capacity, accept/decline on assignment, and an impact/recognition surface. Everything in the discovery doc's "mentor motivation is unknown" section is downstream of the fact that mentors currently have no product.
2. **Replace (or supplement) imposed matching with previewed, consented matching.** Whether via patient-side browsing of Pal profiles or a system-proposed match both parties confirm, the goal is the same: no human is handed another human without either one agreeing. This simultaneously kills the waiting screen, kills the admin bottleneck, and gives both sides agency.
3. **Rebuild the domain language before anything else.** Separate the feature name, the supporter role, and the seeker role into three distinct, non-overlapping terms. Every downstream copy decision depends on this, and it is the cheapest structural fix available.
4. **Make capacity a first-class, self-managed concept for both patient and employee Pals.** Same model, different defaults — not two different systems. Remove the 1-assignment cap, which is the single largest artificial constraint on supply.
5. **Design the relationship lifecycle explicitly** — archive instead of delete, pause instead of end, reconnect instead of re-queue. The current model only knows "matched" and "destroyed."
6. **Introduce need-based matching alongside procedure-based matching.** Let the requester express what she wants support *with*, not just which acronym she's on. Treatment code overlap is a weak proxy for emotional fit, and it's currently the only signal in the system.
7. **Deprioritize moderation redesign.** Per production data the report feature is effectively unused; carry current dismiss/delete functionality forward and reinvest that effort in matching and the mentor experience.

## 2.5 Prioritized Action List (impact vs. effort)

| # | Change | Impact | Effort | Why it ranks here |
|---|---|---|---|---|
| 1 | Rewrite entry screen: explicit "get support / give support" fork + "How it works" | **Very high** | **Low** | Fixes the documented top pain point, removes admin rework, directly serves the JTBD. Cheapest high-value change available. |
| 2 | Fix the waiting state: expected wait, human-in-the-loop reassurance, progress | **Very high** | **Low–med** | Addresses the single biggest emotional drop-off point without changing the matching architecture. |
| 3 | Give Pals capacity, availability, and accept/decline | **Very high** | **Medium** | Unlocks the constrained side of the marketplace and creates the mentor experience that currently doesn't exist. |
| 4 | Consented matching (preview → both parties confirm) | **High** | **Med–high** | Structurally removes imposed matches and the admin bottleneck; the core of the redesign. |
| 5 | Non-destructive endings: archive, rematch-without-loss, pause | **High** | **Medium** | Removes an irreversible-data-loss trap and converts churn into retention. |

*(Terminology rework isn't listed as a discrete action because it's a prerequisite that runs through items 1, 3, and 4.)*

---

# 3. Open Questions — Split by Owner

Three buckets, because they need different handling. **Bucket A** we answer ourselves in this workshop (they're design/BA calls). **Bucket B** must go to the client — they carry cost, legal, policy, or operational weight we cannot decide unilaterally. **Bucket C** needs real discovery (interviews/data) and must not block the concept — we make a defensible assumption, label it as an assumption, and flag it for validation.

## 3.A — We decide (design/BA calls, resolved in this workshop)

| # | Question | Why it's ours | Blocks |
|---|---|---|---|
| A1 | How does a first-time user choose between seeking and giving support? | Pure interaction design | Entry screen, IA |
| A2 | What replaces the waiting screen — and if a wait remains, what's shown on it? | UX of system status | Requester flow |
| A3 | What does a Pal profile card contain, and what's shown to whom at match time? | Content design; we already know the 4 social-profile fields | Discovery/browse, match moment |
| A4 | Does the requester declare needs separately from her clinical treatment record? | Matching data model design | Matching quality |
| A5 | What are the relationship states (requested → matched → active → paused → ended → archived)? | Lifecycle modeling | Everything downstream |
| A6 | Archive vs. delete on conversation end — and what "rematch" does to history | Interaction + data design | End flow, retention |
| A7 | How is the treatment taxonomy reconciled into one canonical list across mobile + Back Office? | Information architecture | Both apps, matching |
| A8 | Rating/feedback pattern — align with the app's existing NPS anchoring precedent? | Design system consistency | End-of-conversation flow |
| A9 | What does the Back Office console become if matching is no longer manual? | Product/IA design | Whole web side |
| A10 | Where does the Community Guidelines gate sit in the flow? | Flow sequencing | Onboarding |

**Note:** two questions from earlier sections are already **resolved** and should not be reopened — (1) identity display is the patient's choice of real name or alias, employees always real name; (2) moderation is deprioritized per production usage data.

## 3.B — Client must decide (take these to the client)

These carry policy, legal, cost, or organizational consequences. Recommend presenting each with our recommended option (Section 4) rather than as an open-ended question.

**Trust, safety & liability**
- **B1. Should Patient Pals be formally verified or approved?** Today there's no criteria — approval is defined by not being rejected. Does the client want a real gate (screening questions, minimum time-since-treatment, coordinator sign-off), or is low-friction volume the priority? *Has legal and safeguarding implications.*
- **B2. What is Pixel's liability position if a Pal gives harmful quasi-medical advice?** The guidelines say "refrain from giving medical advice," but nothing enforces it and nothing monitors it. Does the client require any active safeguard, or is the disclaimer considered sufficient? *Legal must answer this, not us.*
- **B3. Is there a minimum recovery/distance requirement before a patient can become a Pal?** Supporting others mid-crisis, or immediately after a failed cycle, may harm the volunteer. Clinical/ethical call, not a design call.
- **B4. Can a patient hold both roles simultaneously** (receiving support while giving it)? Emotionally plausible and good for supply — but the client may have a policy view.
- **B5. PHI exposure in free-text peer chat.** Patients will share diagnoses, medications, clinic names with each other. Does the client's HIPAA posture require anything beyond the existing guidelines document — retention limits, warnings at point of writing, staff access rules?

**Operating model & cost**
- **B6. Is the client willing to move away from admin-mediated matching?** This is the fork the entire concept hangs on. Manual matching is their current control mechanism; self-discovery removes a safety checkpoint in exchange for scale and speed.
- **B7. Are employee Pals a growth lever or a stopgap?** ~2 today with high capacity. If the answer is "we can staff more," the supply problem is partly solvable operationally and matching design changes accordingly.
- **B8. Is there budget/appetite for mentor recognition mechanics** (badges, status, thank-you moments)? Cheap to design, but implies ongoing program ownership nobody currently holds.
- **B9. Who owns this program operationally after launch?** Today it's absorbed into general admin work. A two-sided community feature needs an owner — if there isn't one, the concept must be self-running by design.

**Scope & data**
- **B10. Confirm which Figma generation is authoritative** (the newer flow vs. the legacy Lorem Ipsum + Privacy Policy checkbox + "Refuse Pixel Pal" version). We've assumed the newer; needs confirmation before it's a baseline.
- **B11. Can we get real usage numbers?** Requests/month, median time-to-match, % of matches that produce ≥1 reply, median conversation length, % ending in <7 days, mentor repeat rate. We are currently designing without a single quantitative measure of whether this feature works. *This is the highest-value ask on the list.*
- **B12. What is the actual decision process behind "Convert to Pixel Pal"?** Documented as undocumented — likely an informal judgment call after personal contact with a patient. Should it be formalized, kept informal, or removed?
- **B13. Where did the "1 active assignment" limit come from?** If it's a deliberate safeguarding decision, that changes the recommendation; if it's an arbitrary default, it's the easiest supply unlock available.

## 3.C — Needs real discovery (assume, label, validate later — do not block on)

- **C1. Mentor motivation.** Why do people volunteer, what makes them stay, what makes them stop? Explicitly unknown in the discovery doc. *Working assumption for the concept: motivated by reciprocity and meaning ("someone helped me / I want my experience to count"), sustained by visible impact and low-pressure commitment. Needs 5–8 mentor interviews to confirm.*
- **C2. What requesters actually want from a match.** Same procedure? Same outcome? Same life stage (age, first cycle vs. fourth, with/without existing children)? We currently match on procedure code because that's the only data collected — which may be the weakest available signal. *Assumption: emotional/situational similarity matters at least as much as procedure. Needs validation.*
- **C3. Do patients want to choose their own match, or is being chosen for them comforting?** Self-selection gives agency but adds decision load to an already overloaded user, and creates a "nobody picked me" failure mode for mentors. *Assumption: offer a curated shortlist rather than an open directory — agency without infinite choice. Needs testing.*
- **C4. Tolerance for waiting.** Is a 2-day wait acceptable if it's explained? Days matter enormously for the design; guessing is risky. *Assumption: an explained wait with a stated range is tolerable; an unexplained one is not.*
- **C5. Why is the Report feature unused?** Because behavior is genuinely good, or because reporting is undiscoverable behind a kebab, or because users fear consequences? These have opposite implications. Low priority per client, but worth one line of inquiry before we conclude "no problem exists."
- **C6. How many people does a mentor actually want to support?** Directly determines the default capacity value. *Assumption: 3, self-adjustable. Needs mentor input.*
- **C7. What ends a peer-support relationship naturally?** Treatment ending? Outcome (good or bad)? Drift? We have no lifecycle data, and the answer shapes whether "ending" should feel like failure or graduation. *Assumption: most relationships fade rather than terminate — design for graceful dormancy, not binary closure.*

## 3.D — How to use this in the client presentation

Do not present this list as a wall of unknowns; it reads as unpreparedness to a results-oriented stakeholder. Recommended handling:

- **Bucket A** → never shown as questions. They appear only as *decisions already made*, inside the concept.
- **Bucket B** → compressed to the 4–5 that genuinely gate the build (B1, B2, B6, B11, B13) and framed as *"we recommend X, we need your confirmation"* — each with the options table from Section 4 as backup.
- **Bucket C** → shown as a short "what we'd validate next" slide at the end, framed as post-pitch discovery, with our working assumptions stated. This demonstrates rigor rather than gaps.

---

# 4. Decisions — Options, Trade-offs, Recommendations

Each decision below gets: the real options, honest trade-offs, and a recommendation. Recommendations marked ⚠️ depend on a client answer from Section 3.B; we proceed on a stated assumption and flag it.

---

## D1. Matching model *(the fork everything else hangs on)*

| Option | Pros | Cons |
|---|---|---|
| **A. Keep manual admin matching** | Human judgment on sensitive pairings; a safety checkpoint; admin sees the whole board | Doesn't scale; unbounded wait; admin is a single point of failure; the documented #1 operational pain |
| **B. Open directory — patient browses all Pals freely** | Instant, zero admin, maximum agency | Choice overload for an anxious user; "shopping for humans" framing; popular Pals swamped, others never picked (visible rejection for volunteers); heavy filtering UI |
| **C. Curated shortlist + mutual consent** — system proposes 3 matches, requester picks one, Pal accepts/declines | Agency without infinite choice; both sides consent; no imposed matches; admin out of the critical path; failure modes are soft (a decline is private) | Needs a ranking rule; a decline still needs graceful handling; requires Pal responsiveness |
| **D. Hybrid — C by default, admin override for flagged/complex cases** | Scale by default, human judgment where it matters (e.g. repeated declines, sensitive situations) | Two paths to maintain; admin tooling still needed |

**Recommendation: D (C as the default path, with an admin safety valve).** ⚠️ *Depends on B6.* The shortlist of three is the key move: it converts a passive wait into an active choice within seconds, but caps decision load. Mutual consent fixes the "human assigned to a human" problem on both sides. Admin override preserves the client's existing control mechanism for the cases that actually need it, which makes this an easier yes than "we're removing your oversight."

**Ranking inputs for the shortlist:** treatment overlap → declared support needs → availability/capacity headroom → recent responsiveness → life-stage similarity. Deliberately *not* a black box: show the requester *why* each person is suggested ("Also went through two FET cycles").

---

## D2. Terminology

| Option | Feature name | Supporter | Seeker |
|---|---|---|---|
| **A. Keep everything** | Pixel Pal | Pixel Pal | (unnamed) |
| **B. Keep feature name, rename roles** | Pixel Pal | **Pal** | **Member / patient** |
| **C. Rename all three** | e.g. Companion / Peer Support | Companion | Member |

**Recommendation: B.** ⚠️ *Low risk, client may have brand attachment.* "Pixel Pal" has equity and appears in production copy — killing it is a cost with little upside. The actual problem is that one noun does three jobs. Fix: **Pixel Pal = the feature.** **Pal = the person giving support.** **Member = the person receiving it** (never "requester" in UI — it's transactional and it labels someone by their neediest moment). The two entry CTAs then stop sharing a noun entirely, which is what makes D3 possible.

---

## D3. Entry & role selection

| Option | Pros | Cons |
|---|---|---|
| **A. Two buttons (today)** | Simple | Confirmed root cause of wrong-path selection |
| **B. Single "Explore Pixel Pal" → How-it-works → fork** | Explains before asking; one primary CTA | One extra tap for returning users |
| **C. Question-first fork** — "What brings you here?" → *I'd like support* / *I'd like to support someone* | Zero ambiguity; different verbs, different first words | Still needs the explanation somewhere |

**Recommendation: B + C combined.** One entry point → a short "How it works" (3 steps, ~15 seconds) → then the question-first fork. This directly serves the JTBD ("understand how it works, how to apply, what to expect") and removes the coin flip. The fork options must not share a leading word or an icon.

---

## D4. Pal capacity

| Option | Pros | Cons |
|---|---|---|
| **A. Keep 1** | Protects volunteers; simple | Structurally starves supply — the single biggest artificial constraint |
| **B. Fixed higher number (e.g. 3)** | Triples effective supply; simple | Ignores individual difference; some will be overwhelmed |
| **C. Pal sets her own, 1–5, default 3** | Respects volunteer autonomy; self-regulating; matches how employee capacity already works | Requires a setting UI; some will over-commit |
| **D. Earned/tiered capacity** (starts at 1, unlocks with activity) | Quality gate; gamified progression | Paternalistic; slows supply exactly when it's scarce |

**Recommendation: C, default 3, range 1–5.** ⚠️ *Depends on B13 and C6.* Crucially this **unifies the patient and employee models** — same capacity concept, different defaults (employees higher, admin-set as today). Removes the indefensible situation where the unpaid volunteer has less control than the paid staffer. Pair with a soft warning when a Pal raises capacity above 3.

---

## D5. Availability & pacing

**Recommendation:** Introduce an explicit **availability state** on the Pal profile: `Available` / `Paused` / `Not accepting new` — self-controlled, one tap, no explanation required, reversible. Plus **auto-pause** after N days of inactivity (suggested: 14) so idle Pals stop appearing in shortlists and getting matched into silence. This is the cheapest single fix for the "matched with someone who never replies" failure mode, which is the worst possible experience for a vulnerable member.

**Trade-off:** auto-pause could feel punitive. Mitigate with framing — *"We've paused your matches while you're away. Turn back on whenever you're ready."*

---

## D6. What the Member declares

| Option | Pros | Cons |
|---|---|---|
| **A. Nothing (today)** — derive treatment from record | Zero friction | Matching runs on one weak signal; member can't say what she needs |
| **B. Full profile + needs questionnaire** | Rich matching | High friction at the worst moment |
| **C. Three light taps** — *what you're going through* (pre-filled from record, editable) + *what would help most* (2–3 chips: someone who's been through the same treatment / someone who understands the emotional side / someone further along) + optional note | Meaningfully better matching for ~20 seconds of effort; gives the member voice | Slight friction; chips need careful wording |

**Recommendation: C.** ⚠️ *Depends on C2.* Procedure code is a weak proxy for emotional fit. Three chips is the minimum viable expression of need, and it also makes the shortlist explainable ("suggested because she's further along in the same treatment").

**Revised during Phase 1 prototype testing:** dropped the *what you're going through* tap entirely — the product is already built on TR being known, so asking her to confirm it cold isn't fair to her, even framed as "editable." **C becomes two taps** — *what would help most* + optional note — with TR pulled in silently and surfaced passively later (the suggestions screen's subtitle and reason badges), never as a question. Prototype spec §7 (M3) and §5 (`MemberRequest.treatments`) updated to match.

---

## D7. The wait

| Option | Pros | Cons |
|---|---|---|
| **A. Keep a wait, but inform it** (position, ETA, human-in-loop copy) | Honest; low build cost | Still a wait |
| **B. Remove the wait entirely** — shortlist generated immediately | No dead time; agency immediately | Requires enough available Pals; empty-shortlist case must be designed |
| **C. Instant shortlist, fall back to informed wait if supply is thin** | Best of both; graceful degradation | Two states to design |

**Recommendation: C.** With D1+D4+D5 in place, most members get an immediate shortlist. When supply genuinely can't cover (rare treatment, low availability), fall back to a *well-designed* wait: expected range, "a coordinator is personally finding your match," notification promise, and something useful to do meanwhile (read a Pal story, browse community). Never an empty screen with a cancel button.

---

## D8. Relationship lifecycle

**Recommendation:** replace binary `matched → destroyed` with explicit states:

`Suggested → Pending (Pal deciding) → Active → Quiet (no messages 21d) → Paused → Closed → Archived`

Key rules:
- **Ending ≠ deletion.** Conversation is archived and remains readable to both parties unless a party explicitly requests deletion. ⚠️ *Check against B5 retention posture.*
- **"Doesn't feel like a good match" routes to rematch, not closure** — member gets a new shortlist immediately, history preserved, and the Pal is not told the reason.
- **Quiet ≠ failed.** A relationship that goes silent is reframed as dormant with a gentle re-open affordance on both sides, not a failure state.
- **Graduation exists.** When treatment ends, offer a closing moment ("thank your Pal") rather than an abandonment. ⚠️ *Depends on C7.*

**Trade-off:** archived-not-deleted is better UX and worse from a data-minimization standpoint. Legal input required.

---

## D9. Pal verification

| Option | Pros | Cons |
|---|---|---|
| **A. None (today)** | Max supply, zero cost | No safeguarding; approval means "not rejected" |
| **B. Lightweight self-attestation** — confirm treatment complete, agree to conduct, acknowledge no medical advice | Cheap; creates a record; sets expectations | Not real verification |
| **C. Coordinator review** of experience + short written answer | Real quality gate; catches poor fit | Admin cost; slows supply; needs criteria |
| **D. Full screening/training** | Highest quality | Expensive; kills volume |

**Recommendation: B + light-touch C.** ⚠️ *Client must decide — B1/B3.* Self-attestation for everyone, plus one reviewable free-text answer ("why do you want to support someone?") that an admin can scan in seconds and reject on. This keeps the funnel fast while giving the client a real gate and an audit trail. Add a **minimum distance rule** if clinical says so (e.g. not currently mid-cycle) — that's B3, and it's their call, not ours.

---

## D10. Mentor recognition

**Recommendation:** minimum viable and non-gamified — no badges, no leaderboards, no streaks. In a fertility context, competitive mechanics would be tone-deaf. Instead: **a private impact surface** on the Pal's profile ("You've supported 4 members through IVF · 112 messages sent"), **the member's thank-you moment** passed through at graduation, and **a coordinator-sent acknowledgment** at milestones. ⚠️ *Depends on B8 and C1.* Everything here is cheap; the expensive part is that someone must own sending the acknowledgments.

---

## D11. Can one person hold both roles?

**Recommendation: yes, but not simultaneously by default.** ⚠️ *Client decision B4.* A member who finishes treatment is the single best recruitment pool for Pals — the graduation moment is the natural ask ("would you like to do this for someone else?"). Allowing both *at once* risks a patient supporting others while in crisis. Default: sequential, with an opt-in override.

---

## D12. What Back Office becomes

If matching is largely automated, the admin console changes purpose from **doing the matching** to **running the program**:

- **Health dashboard:** unmatched members and how long they've waited, shortlists with no acceptance, Pals who never replied, capacity headroom by treatment type
- **Exception queue** (replaces the assign console): only cases needing a human — thin supply, repeated declines, flagged relationships
- **Pal roster** with the sorting/filtering/availability that today's list lacks: sortable by last activity, availability, capacity used, treatment
- **Manual assign retained** as an override tool, not the primary workflow
- **Moderation:** carry forward as-is per production data — low priority

**Trade-off to name in the pitch:** the client loses per-match oversight and gains program-level oversight. This is the argument that needs to land.

---

## D13. Chat trust & cold start

**Recommendation:**
- **Response-time expectation shown in-thread**, not just in onboarding ("Pals usually reply within a day")
- **Shared-context banner** at the top of a new thread ("You've both been through two FET cycles")
- **Three opener prompts** on the empty thread for both parties — the single highest-leverage anti-drop-off fix in the chat
- **Report/safety made visible**, not buried behind an unlabeled kebab — even though reports are rare, discoverability is the point (see C5)
- **No read receipts.** In this context they convert silence into visible rejection.

---

## D14. Prototype scope *(needed before the build)*

| Decision | Recommendation |
|---|---|
| Which flows at full fidelity? | Mobile: entry/fork → how-it-works → member request + shortlist → match → chat; Pal: apply → availability/capacity → accept/decline → chat. Back Office: health dashboard + roster + exception queue |
| Simulate both sides? | **Yes** — a role switcher so the client can experience member, Pal, and admin on the same seeded scenario. This is what makes it "fully testable" |
| Real data? | No backend. Seeded mock dataset, ~12 Pals with varied treatments/availability, 5 members, 3 conversations in different lifecycle states |
| Reset? | Yes — a demo control to reset state and to jump to any scenario, so the client can re-run the "aha" flow repeatedly |

---

# 5. Fresh Ideas

Section 2 fixed what's broken. This section is about what Pixel Pal could be that it currently isn't. Each idea is tagged **[AHA]** if it's a demo moment for the pitch, and rated on effort. Ideas that carry real risk say so.

---

## Theme A — Make the match feel *chosen*, not assigned

### A1. "Why her" — explainable matching **[AHA]** · Low effort
Every suggestion in the shortlist carries a plain-language reason: *"Also went through two rounds of FET"* · *"Further along in the same treatment"* · *"Said she wants to talk about the emotional side too."* The system already knows this; today it hides it. Explainability turns an algorithmic output into what feels like a thoughtful human recommendation — which is exactly what the manual process was doing invisibly all along. **This is the single cheapest "aha" in the deck.**

### A2. Pal story cards instead of blank bios · Low effort
Replace one free-text "about me" with a light three-prompt structure the Pal fills in:
- *Where I was* — "Two failed IVF cycles before our daughter"
- *What helped me* — "Someone who'd normalize how angry I felt"
- *What I can offer* — "Honest talk about the two-week wait"

Same effort for the writer, dramatically better for the reader, and it makes shortlist cards scannable. Solves the "writing into a void" friction from §2.2B at the same time — you're answering questions, not facing a blank box.

### A3. The intro note **[AHA]** · Low effort
When a member picks someone from her shortlist, she writes a short note (2–3 lines, optional, prompted). The Pal sees that note when deciding whether to accept. This does three jobs at once: it makes accept/decline *informed* rather than arbitrary, it breaks the cold-start silence before the thread even opens, and it converts a system event into a human one. Without it, "accept/decline" is a judgment on a stranger's profile; with it, it's a response to a person.

---

## Theme B — Solve the supply problem structurally

### B1. The pass-it-forward loop **[AHA]** · Medium effort
The single highest-leverage idea here. Today, demand and supply are recruited through the same ambiguous screen. Instead: **treatment completion becomes the recruitment moment.** When a member's relationship graduates — or her treatment concludes — she gets one warm, well-timed ask: *"[Pal name] was there for you. Would you do that for someone else?"*

This is structurally elegant: every satisfied member is a candidate Pal, at the exact moment her experience is most vivid and her gratitude is highest. It converts the feature from a two-sided market with a chronic supply shortage into a **self-replenishing cycle**. It also answers the mentor-motivation unknown (C1) with the most reliable motivator available: reciprocity.

### B2. Time-boxed commitment · Low effort
Reframe the volunteer ask from open-ended ("become a Pixel Pal") to bounded ("support one person through one cycle"). Open-ended emotional commitments are the ones people decline. A defined endpoint lowers the barrier to saying yes, and the graduation moment then becomes a natural renewal point — most people who complete one will opt in again. Same supply, much lower psychological entry cost.

### B3. Support circles — one Pal, several members · High effort · Later phase
A small group (3–5 members, same treatment stage) with one Pal. Breaks the 1:1 arithmetic that makes supply scarce, and members often benefit as much from each other as from the mentor. Real risks: group dynamics need moderation, disclosure is riskier in a group, and one bad outcome is witnessed by everyone. **Recommend as a phase-2 concept in the pitch, not in the prototype** — it's the "where this could go" slide.

---

## Theme C — Lower the emotional cost of participating

### C1. Treatment milestone awareness (member-controlled) **[AHA]** · Medium effort · ⚠️ Privacy-sensitive
The app already knows the member's treatment calendar. With **explicit opt-in per item**, a member can let her Pal see selected upcoming milestones — *"Transfer on Thursday"* — so the Pal can reach out unprompted. That unprompted "thinking of you today" message is the emotional core of what good peer support actually looks like, and no product currently enables it.

**This must be opt-in, granular, member-controlled, and revocable**, and it should share *stage labels only*, never clinical detail. Take it to legal alongside B5. High reward, real PHI exposure — do not ship it as a default.

### C2. Low-pressure check-ins instead of an open thread · Low effort
Not every exchange should require composing a paragraph. Offer lightweight reactions and prompts — a "thinking of you" tap, a short check-in template — so a Pal with a busy week can still show up. Reduces the guilt-driven silence that kills relationships: people go quiet because they can't face writing something adequate, not because they stopped caring.

### C3. Silence is buffered, not surfaced · Low effort
No read receipts, no "last seen." Instead, thread-level expectation copy: *"Pals usually reply within a day — she's seen your message and will get back to you."* In this population, visible-but-unanswered is a uniquely painful state, and read receipts manufacture it.

### C4. Pal wellbeing check · Low effort
When a member's cycle fails, or a relationship ends abruptly, check on **the Pal**. She just absorbed someone else's loss, often while carrying her own history of it. A single acknowledgment — plus an easy path to pause — is cheap, and it's the kind of detail that signals the product understands emotional labor. Nobody in this space does this.

---

## Theme D — Keep peer support safely non-clinical

### D1. One-tap escalation to the care team **[AHA]** · Low effort
Inside the Pal chat, a persistent quiet affordance: *"Need a nurse? Talk to your Care Coordinator."* Available to **both** parties — the Pal can hand off when a conversation drifts clinical ("should I change my dose?"), which is precisely the moment the current product leaves a volunteer improvising alone.

This is disproportionately valuable relative to its cost: it materially reduces the liability exposure in **B2**, it reinforces the peer/clinical boundary that the guidelines only *assert*, it gives the Pal a graceful exit from questions she shouldn't answer, and it visibly connects Pixel Pal to the Care Coordinator differentiator the product already invests in. **Lead with this one when the client asks about risk.**

### D2. Guidance at the point of writing · Low effort
The Community Guidelines are a document nobody reads at the wrong moment. Move the substance to where it matters: a light, one-time inline note in the composer for a new Pal — *"Share your experience, not advice. If she asks something medical, point her to her care team."* One sentence, in context, at the moment of risk beats ten principles in a modal at the moment of joy.

---

## Theme E — Longer-horizon bets (pitch as "where this goes," don't prototype)

- **E1. Pal reflections in Community** — short, published pieces from Pals ("what I wish I'd known before my first transfer"). Gives Pals an audience beyond one person, creates discoverable value for members not yet matched, and lets people see what Pals are like before committing. Also useful content for the waiting state.
- **E2. Matching that learns** — feed accepted/declined shortlists and conversation health back into ranking. Only viable once there's volume; worth naming so the concept doesn't look static.
- **E3. Milestone-triggered matching** — proactively offer a Pal at known-hard moments (first injection, two-week wait, a failed cycle) rather than waiting for the member to seek one out. Shifts the feature from reactive to anticipatory. Needs care: an unsolicited offer at a raw moment can land badly.

---

## 5.1 The three demo moments

If the client remembers only three things from the prototype, make them these:

1. **Request → shortlist in seconds, each with a reason** (A1) — replaces the waiting screen, and it's instantly, viscerally better than what exists.
2. **The intro note → Pal accepts** (A3) — shows both sides consenting, which is the concept's central argument.
3. **Graduation → "would you do this for someone else?"** (B1) — the moment the client sees the feature stop being a cost center and start compounding.

## 5.2 What we're deliberately *not* doing

Worth stating in the pitch, because restraint reads as judgment:
- **No gamification** — no badges, streaks, or leaderboards. Competitive mechanics in a fertility context are tone-deaf, and the motivation here is meaning, not points.
- **No open directory** — browsing humans like listings invites both choice paralysis and visible rejection.
- **No AI-generated support messages** — the entire value proposition is that a real person who has been through it is on the other end. Nothing may blur that.
- **No moderation overhaul** — production data says reports are effectively unused; the effort belongs elsewhere.

---

# 6. The Concept

## 6.1 In one paragraph

Pixel Pal becomes a **self-replenishing peer support cycle** rather than an admin-operated matching desk. A member asks for support, is offered three explained suggestions within seconds, chooses one, and writes her a short note; the Pal reads that note and accepts. Both sides consented, nobody waited, and no administrator touched it. Pals control their own capacity and availability, so nobody is matched into silence. When treatment concludes, the relationship graduates rather than being deleted — and the member is asked whether she'd like to do the same for someone else. Back Office stops assigning matches and starts running the program: watching the health of supply, and stepping in only where the system can't cope.

## 6.2 Principles

1. **Nobody waits without knowing why.** Every wait has a stated reason, a stated range, and something to do.
2. **No human is handed to another human.** Both sides choose.
3. **Show the reasoning.** A match that explains itself feels considered; one that doesn't feels random.
4. **The volunteer is a user, not a resource.** She gets control, protection, and closure.
5. **Peer support is not clinical support** — and the product should make that boundary easy to hold, not just assert it.
6. **Nothing is destroyed.** Endings archive, pause, or graduate.

## 6.3 Roles & language (final)

| Concept | Name in UI | Notes |
|---|---|---|
| The feature | **Pixel Pal** | Unchanged — retains equity |
| Person giving support | **Pal** | Patient Pal or Pixel Pal (employee); same model, different defaults |
| Person receiving support | **Member** | Never "requester" in UI |
| Staff running the program | **Coordinator** | Back Office |

Identity: patients display real name or alias, their choice. Employees always display real name. Both sides always show the same profile fields — **symmetry is a rule, not a preference.**

---

## 6.4 Member journey

### 1 · Entry — Contacts screen
One card, one primary action: **"Find a Pixel Pal."** No twin buttons. Below it, one quiet secondary link: *"Or support someone else →"*. The seeking action is primary because that's the intent of someone on a "How can we help?" screen; the giving action is present but not competing.

### 2 · How it works *(3 cards, ~15 seconds, skippable on return)*
- *We'll suggest three people who've been where you are*
- *You choose who feels right and say hello*
- *They're peers, not medical staff — your care team is still one tap away*

This screen is the JTBD, discharged in fifteen seconds. **Then** the fork appears: *I'd like support* / *I'd like to support someone* — different verbs, different icons, no shared noun.

### 3 · What would help *(3 taps)*
- **What you're going through** — pre-filled from her treatment record, editable, with plain-language labels and an "I'm not sure" option
- **What would help most** — chips: *someone who's been through the same treatment* · *someone who understands the emotional side* · *someone further along than me*
- **Anything else?** — optional free text

No blank-page bio. She is answering questions, not composing an introduction to strangers.

### 4 · Your suggestions **[AHA]**
Three Pal cards, each showing: photo, name/alias, story card (*where I was · what helped me · what I can offer*), treatment tags, availability, typical reply time — and, prominently, **the reason she's suggested**: *"Also went through two rounds of FET."*

Actions per card: **Choose her** · *See full profile* · *Not for me* (quietly replaces that card with another, no explanation asked).

**Thin-supply fallback:** if fewer than three qualify, show what exists, say so honestly (*"We found one person who matches closely. More Pals join every week."*), and offer to notify her when others match. If none, an **informed wait**: expected range, "a coordinator is personally finding your match," notification promise, plus something to read meanwhile. Never an empty screen with only a cancel button.

### 5 · Say hello **[AHA]**
Prompted note to the person she chose, 2–3 lines, optional but strongly scaffolded (*"Tell her where you are right now"* / *"Ask her something you've been wondering"*). Sent with the request.

### 6 · Pending
A calm state, not a void: *"[Name] will see your note and get back to you — usually within a day."* She can withdraw. Critically, she is **not blocked** — she may keep her other two suggestions warm, so a decline never returns her to zero.

**If declined:** phrased as availability, never rejection — *"[Name] isn't able to take someone new right now. Here are your other suggestions."* Her remaining shortlist is already on screen.

### 7 · Connected
Guidelines acknowledged here as a **single inline line with a link**, not a full-screen modal (moved off the emotional peak). Thread opens with a **shared-context banner** (*"You've both been through two FET cycles"*), her intro note already in place, and three opener prompts for the Pal.

### 8 · The relationship
- Expectation copy in-thread, no read receipts
- Lightweight check-ins for low-energy days
- Optional, granular **milestone sharing** — per item, revocable ⚠️ *legal review*
- Persistent, quiet **"Need a nurse? Talk to your Care Coordinator"**
- Safety actions visible in a labeled menu, not an unlabeled kebab

### 9 · Changing or ending
Three distinct outcomes, no longer collapsed into one destructive path:
- **Pause** — "I need a break" · relationship dormant, resumable, nothing lost
- **Find someone else** — new shortlist immediately; conversation archived and still readable; the Pal is *not* told the reason
- **Graduate** — treatment concluded or support no longer needed → a closing moment: a thank-you passed to the Pal, then **the pass-it-forward ask** **[AHA]**

Chat history is **archived, never deleted** ⚠️ *pending B5*. Quiet threads (21 days) become dormant with a gentle re-open affordance on both sides — dormancy is not failure.

---

## 6.5 Pal journey

### 1 · Becoming a Pal
Entry from the fork, from the graduation ask, or from Community. Flow:
- **What this is** — honest about the commitment: *"Support one person through one cycle"* (time-boxed, not open-ended)
- **Your experience** — the same taxonomy, with definitions and "I'm not sure"
- **Your story** — three prompts, not a blank box
- **Your capacity** — how many people at once (default 3, range 1–5)
- **Attestation** — treatment complete · will share experience, not medical advice · will point clinical questions to the care team
- **One reviewable answer** — *"Why do you want to support someone?"* — the coordinator's light-touch gate

### 2 · Application status *(fixes the current void)*
Explicit states with visible copy: **Submitted → In review → Active** (or *Not this time*, with a reason and a path back). No more approval-by-absence-of-rejection.

### 3 · Pal home
Her own surface, which today does not exist:
- **Availability toggle** — Available / Paused / Not taking new — one tap, no explanation required
- **Capacity** — adjustable any time; soft warning above 3
- **Active conversations** with quiet nudges where a member is waiting
- **Impact** — *"You've supported 4 members through IVF"* — private, non-competitive, no badges
- **Auto-pause** after 14 days inactive, framed warmly and instantly reversible

### 4 · A request arrives
Notification → she sees the member's profile, what she's going through, what would help, and **the intro note**. Then: **Accept** · **Not right now** (private, no reason required, member sees only availability language) · **Pause my matches**.

### 5 · Support & closure
- Openers on the empty thread; check-in tools; escalation affordance
- Inline composer guidance on her first message ⚠️ *supports B2*
- **Wellbeing check** after a member's difficult outcome, plus an easy path to pause
- At graduation: the member's thank-you, an impact summary, and a renewal choice — *support someone else* or *take a break*

---

## 6.6 Coordinator / Back Office

The console stops being an assignment desk and becomes a **program cockpit**.

**Program health (landing view)**
- Members unmatched, and for how long — the only genuinely urgent queue
- Shortlists with no acceptance (supply is present but unresponsive)
- Matches with no first reply after 48h — the highest-risk failure state
- Capacity headroom **by treatment type** — where supply is thin *before* it becomes a wait
- Pals idle / auto-paused / at capacity

**Exception queue** — only what needs a human: no viable suggestions, repeated declines, flagged relationships, sensitive cases.

**Pal roster** — with everything today's list lacks: sort and filter by availability, capacity used, last activity, treatment; applications with the reviewable answer inline; capacity editable per person (patients *and* employees, same model).

**Manual assign** — retained as an override, not the primary workflow.

**Moderation** — carried forward as-is. Low priority per production data.

**The trade to name explicitly in the pitch:** the client loses per-match oversight and gains program-level oversight — plus the ability to see supply problems coming instead of discovering them in a backlog.

---

## 6.7 System rules

**Matching rank:** treatment overlap → declared support need → availability & capacity headroom → recent responsiveness → life-stage similarity. Shortlist = top 3, each with a human-readable reason. Deliberately not a black box.

**Relationship states:** `Suggested → Pending → Active → Quiet (21d) → Paused → Graduated → Archived`

**Capacity:** Pal-set, 1–5, default 3 (employees admin-set, higher). Full Pals never appear in shortlists.

**Availability:** Available / Paused / Not taking new · auto-pause at 14 days inactive.

**Concurrency:** one active Pal per member by default; up to three pending suggestions at once, so a decline never resets her to zero.

**Roles:** sequential by default — a member may become a Pal after treatment concludes ⚠️ *B4*.

---

## 6.8 What changes

| | Today | Concept |
|---|---|---|
| Choosing a role | Two near-identical buttons | Explained, then an unambiguous fork |
| Getting matched | Unbounded wait, admin-assigned | Three explained suggestions in seconds |
| Consent | Imposed on both sides | Member chooses, Pal accepts |
| Member's voice | Nothing declared | What she's going through + what would help |
| Pal capacity | 1 (patients) / admin-set (employees) | Self-set 1–5, one model for both |
| Pal control | None | Availability, capacity, accept/decline, pause |
| Pal feedback | None | Status, impact, thank-you, wellbeing check |
| Bad match | Delete everything, rejoin queue | New shortlist, history intact |
| Ending | Destruction | Pause · rematch · graduate — always archived |
| Supply growth | Ambiguous button | Graduation → pass it forward |
| Clinical boundary | Asserted in a document | One-tap escalation, in-context guidance |
| Back Office | Assignment desk | Program cockpit + exception queue |

---

*Next: Section 7 — the build spec for Claude Code.*
