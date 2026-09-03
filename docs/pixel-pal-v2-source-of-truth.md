# Pixel Pal V2 — Source of Truth

## Status
This document defines the CURRENT Pixel Pal concept.

Anything in older project documentation, code, routes, mock data, or UI that conflicts with this document should be treated as LEGACY behavior (V1, or superseded earlier V2 drafts).

Do not infer V2 product behavior from existing V1 implementation, and do not infer matching rules from the V1 Member/Pal model.

---

## Scope

Current prototype scope is Pixel Pal V2 inside the existing Main App, for patients whose treatment context is already known to the app.

Early Entry integration is a later adaptation and is NOT part of the current prototype scope.

Do not invent Early Entry behavior in the current V2 implementation.

---

## Core model

Pixel Pal is a peer-to-peer connection between two patients.

There are no separate Member / Requester / Pal / Mentor / Mentee roles.

Both people are equal participants in the connection.

For MVP:
- One person can have one active Pixel Pal connection at a time.
- Matching is automatic: Pixel Pal V2 uses automatic 1:1 peer matching. There is no mutual opt-in for an individual match.

---

## Matching

Users do not browse, compare, accept, or decline potential Pixel Pals.

Do not use:
- profile carousels;
- lists of suggested Pals;
- swipe/dating-app patterns;
- Pal applications;
- Pal capacity;
- Pal availability;
- incoming support requests;
- mutual opt-in / accept-or-decline match requests.

When the system identifies a compatible match, the connection is created automatically.

Automatic matching does not force either person to message — the experience can invite them to say hello.

`Find someone else` is the user-controlled way to leave a connection that does not feel right and return to matching. Do not expose rejection language or tell the other person why the connection ended.

### Matching algorithm — OPEN

The final matching algorithm is not defined yet. The following are OPEN and will be defined separately with Product/BA:
- eligibility;
- treatment compatibility;
- experience/stage compatibility;
- ranking;
- fallback rules;
- exact matching preferences/questions.

The prototype should use mocked/deterministic matching logic only, to demonstrate the end-to-end experience.

Do not infer matching rules from the V1 Member/Pal model.

---

## Social Profile

Pixel Pal reuses the patient's existing Social Profile. There is no separate Pixel Pal profile.

Per existing Social Profile behavior:
- name may be a first name or an alias;
- the profile image may be a real photo, an arbitrary/non-identifying image, or initials;
- About Me may be shown to a Pixel Pal when the patient has chosen to provide it.

Pixel Pal should not require patients to create a new identity or re-enter information that already exists in their Social Profile — including treatment information already known by the Main App (see Treatment privacy).

Users may optionally add more context to their Social Profile, potentially including:
- fertility treatment history;
- what helped me;
- interests.

Before matching, Pixel Pal may show a preview of the existing Social Profile so the patient understands what their Pixel Pal will see, and can edit it if needed.

Optional profile enrichment must not block or slow down matching.

### Prototype fixture

For the mocked Pixel Pal shown in the V2 prototype, use a privacy-friendly example: an alias and a non-identifying avatar rather than a real patient photo.

This is a prototype presentation choice, not a production rule requiring all patients to use aliases or non-identifying avatars.

---

## Treatment privacy

Treatment information may be used privately by the system for matching without automatically being shown to the other person.

Using information for matching and disclosing information to a Pixel Pal are separate concepts.

Exact treatment disclosure UX is NOT YET DEFINED.

---

## Location privacy

Location is never shown to another Pixel Pal.

Pixel Pal may ask whether the patient prefers someone outside their local area:
- "Yes, outside my local area" — acts as a privacy/matching constraint: the patient prefers not to be matched with someone from their local area.
- "No location preference" — location does not restrict the match.

This preference is separate from, and in addition to, the baseline privacy behavior of reducing the chance of connecting someone with a person they may know locally, regardless of what they choose.

Location is never a positive matching signal — proximity is never used to match people who live near each other.

Do not expose city, state, distance, approximate distance, "X miles away", or any other location information to either Pixel Pal, at any point.

---

## Matching preferences

Matching should be fast and lightweight.

The only explicit matching preference is whether the patient would prefer someone with similar treatment experience:
- "Yes, if possible" — prioritize a Pixel Pal who is currently going through, or has previously gone through, similar treatment. Current-vs-past journey stage is not a separate preference.
- "No preference" — treatment similarity is not required. The eligible pool may include people with different treatment experience, as well as Early Entry users who may not have treatment experience yet.

This is a preference, not a user-facing compatibility score.

Journey-stage/person-type ("going through it now" vs. "been through it before" vs. no preference) is no longer collected as a separate preference — superseded by the treatment-experience preference above.

Do not re-ask journey or treatment information already known by the Main App / Early Entry onboarding.

Do not add interests/hobbies as required matching questions.

Interests may be optional Social Profile information.

Other matching parameters are OPEN — see "Matching algorithm — OPEN" above.

---

## Relationship experience — keep from V1

The following ideas were positively received and should be adapted to the symmetric peer model:

- help starting a conversation;
- conversation starters;
- share a milestone;
- check-ins / support for quiet conversations;
- pause a conversation;
- end / wrap up a connection;
- optional thank-you;
- find someone else;
- reporting and safety mechanisms;
- guided handling of awkward or unsuccessful moments.

These interactions must work symmetrically for both participants.

---

## Legacy concepts (V1 and superseded V2 drafts)

The following are NOT part of the current concept:

- Member vs Pal role selection;
- Requester / Pal relationship;
- mentor / mentee framing;
- volunteer/support-provider framing;
- Pal application;
- Pal capacity;
- Pal availability;
- Pal Home;
- Incoming Requests;
- Pal Impact;
- choosing from three suggested Pal profiles;
- Pal-specific accept/decline;
- Pal-specific graduation;
- one person being responsible for supporting the other;
- mutual opt-in / accept-or-decline match requests (superseded earlier V2 draft).

Existing code implementing these concepts may remain temporarily for reference/reuse, but must not be treated as current product requirements.

---

## Rule for unresolved decisions

If something is not explicitly defined in this document:

DO NOT infer the answer from V1.

Flag it as an open product question instead.
