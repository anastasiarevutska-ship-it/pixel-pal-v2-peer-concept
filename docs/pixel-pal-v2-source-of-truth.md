# Pixel Pal V2 — Source of Truth

## Status
This document defines the CURRENT Pixel Pal concept.

Anything in older project documentation, code, routes, mock data, or UI that conflicts with this document should be treated as LEGACY V1 behavior.

Do not infer V2 product behavior from existing V1 implementation.

---

## Core model

Pixel Pal is a peer-to-peer connection between two patients.

There are no separate Member / Requester / Pal / Mentor / Mentee roles.

Both people are equal participants in the connection.

For MVP:
- One person can have one active Pixel Pal connection at a time.
- Matching leads to a mutual opt-in before a conversation starts.

---

## Matching

There is no browsing or choosing between multiple people.

Do not use:
- profile carousels;
- lists of suggested Pals;
- swipe/dating-app patterns;
- Pal applications;
- Pal capacity;
- Pal availability;
- incoming support requests.

The exact mutual opt-in flow is NOT YET DEFINED.

Do not invent it until it is specified.

---

## Social Profile

Pixel Pal should reuse the existing app Social Profile rather than create a separate Pal profile.

The Social Profile may contain:
- avatar/image;
- first name or alias;
- About Me.

Users may optionally add more context, potentially including:
- fertility treatment history;
- what helped me;
- interests.

Users should be able to preview what another Pixel Pal will see.

Optional profile enrichment must not block or slow down matching.

---

## Treatment privacy

Treatment information may be used privately by the system for matching without automatically being shown to the other person.

Using information for matching and disclosing information to a Pixel Pal are separate concepts.

Exact treatment disclosure UX is NOT YET DEFINED.

---

## Location privacy

Location is never shown to another Pixel Pal.

Location may only be used privately by the matching system to reduce the chance of connecting someone with a person they may know locally.

The user may express a preference for more geographic distance.

Do not expose city, state, exact distance, or location in the Pixel Pal profile.

---

## Matching preferences

Matching should be fast and lightweight.

One confirmed dimension to explore is whether the person prefers:
- someone going through a similar experience now;
- someone who has been through it before;
- no preference.

Do not add interests/hobbies as required matching questions.

Interests may be optional Social Profile information.

Other matching parameters are NOT YET DEFINED.

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

## Legacy V1 concepts

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
- one person being responsible for supporting the other.

Existing code implementing these concepts may remain temporarily for reference/reuse, but must not be treated as current product requirements.

---

## Rule for unresolved decisions

If something is not explicitly defined in this document:

DO NOT infer the answer from V1.

Flag it as an open product question instead.
