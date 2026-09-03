import type { DashboardContent, MemberRequest, PalProfile, Person, Relationship } from './types'
import avatarElena from '../assets/pals/pal-elena.jpg'
import avatarPriya from '../assets/pals/pal-priya.jpg'
import avatarGrace from '../assets/pals/pal-grace.jpg'
import avatarDana from '../assets/pals/pal-dana.jpg'
import avatarMonica from '../assets/pals/pal-monica.jpg'
import avatarBeth from '../assets/pals/pal-beth.jpg'
import avatarFarrah from '../assets/pals/pal-farrah.jpg'
import avatarOlivia from '../assets/pals/pal-olivia.jpg'
import avatarTessa from '../assets/pals/pal-tessa.jpg'
import avatarRuth from '../assets/pals/pal-ruth.jpg'
import avatarWhitney from '../assets/pals/pal-whitney.jpg'
import avatarLeila from '../assets/pals/pal-leila.jpg'
import avatarJordan from '../assets/pals/pal-jordan.jpg'

/**
 * Seed data — spec §6. Built for all three roles from day one per §2, not
 * just what Phase 1 currently reads: 12 Pals (varied treatments,
 * capacities, availability — two full, two not-taking-new, one employee, one
 * alias), 6 members, and relationships spanning
 * active / quiet / graduated / pending. Dates are computed relative to
 * "now" so "25 days silent" stays true whenever the demo runs.
 *
 * Two of those members are deliberately separate demo protagonists, one per
 * journey — see `samantha` and `jordan` below.
 */

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()
}

// ---------------------------------------------------------------------------
// Members

export const members: Person[] = [
  {
    id: 'member-samantha',
    displayName: 'Samantha',
    usesAlias: false,
    avatarUrl: '',
    kind: 'patient',
    age: 34,
    location: 'Denver, CO',
    // Mock Social Profile content — used by both `SocialProfilePreview` and
    // `SocialProfileEdit` so "how your Pixel Pal will see you" has something
    // real to show and edit in the demo.
    signature: 'Two rounds of IVF down, still smiling most days.',
    aboutMe: 'Denver-based, love hiking and terrible reality TV. Here for anyone who needs to vent at 2am.',
    socialLinks: ['instagram.com/samantha.tries'],
  },
  {
    id: 'member-maya',
    displayName: 'Maya',
    usesAlias: false,
    avatarUrl: '',
    kind: 'patient',
    age: 29,
    location: 'Austin, TX',
  },
  {
    id: 'member-firefly',
    displayName: 'Firefly',
    usesAlias: true,
    avatarUrl: '',
    kind: 'patient',
    age: 31,
  },
  // The two members whose requests land on the Pal side of the demo. They
  // exist only as counterparties there — waiting on Jordan (below), not on
  // Samantha.
  {
    id: 'member-nadia',
    displayName: 'Nadia',
    usesAlias: false,
    avatarUrl: '',
    kind: 'patient',
    age: 32,
    location: 'Portland, OR',
  },
  {
    id: 'member-jo',
    displayName: 'Jo',
    usesAlias: true,
    avatarUrl: '',
    kind: 'patient',
    age: 37,
  },
  // The Pal-journey demo protagonist — deliberately a different person from
  // Samantha, not a second role of hers. Earlier, both journeys defaulted to
  // the same person: Samantha was simultaneously mid-treatment on her own
  // Home screen and an already-active Pal fielding Nadia's and Jo's pending
  // requests, which only works as "graduated patient becomes a Pal" if you
  // already know that's the intended backstory — on screen it just reads as
  // a contradiction. Splitting the two protagonists removes that entirely.
  // The pass-it-forward *feature* is untouched: Graduate.tsx still asks
  // "would you do this for someone else?" and still routes to /pal — it
  // just no longer has to be literally the same seeded identity underneath.
  // No PalProfile below (see `pals`), same as Samantha never having one:
  // that absence is what sends `/pal` into the application flow (P1–P6)
  // rather than straight to an existing Pal home.
  {
    id: 'member-jordan',
    displayName: 'Jordan',
    usesAlias: false,
    avatarUrl: avatarJordan,
    kind: 'patient',
    age: 36,
    location: 'Chicago, IL',
  },
]

export const samantha = members[0]
export const jordan = members[members.length - 1]

// ---------------------------------------------------------------------------
// Home dashboard content (Figma node 16785:20785) — one entry per person
// who has her own Home. Samantha's values are exactly what `HomeDashboard`
// used to hardcode inline, moved here unchanged so `/home` renders
// byte-identically post-refactor. Jordan's are new — PLACEHOLDER clinical
// content for review, not pulled from anywhere; only the shape (a
// different day, treatment, medication, and appointments so her Home
// doesn't silently show Samantha's data) is load-bearing.

export const dashboards: Record<string, DashboardContent> = {
  [samantha.id]: {
    dayLabel: 'Day 12',
    treatmentLabel: 'of In Vitro Fertilization',
    encouragement: "You're on a remarkable journey and every day is another step.",
    nextDose: { time: '2pm', medication: 'Menopur', detail: '75iu injection' },
    labTest: {
      dateTime: 'Wednesday, Sept. 27 | 3:30pm',
      location: 'Columbus Center for Reproductive Endocrinology & Infertility',
    },
    delivery: { dateTime: 'Wednesday, Sept. 27 | 6:00pm', detail: '2 medications are coming today.' },
  },
  [jordan.id]: {
    dayLabel: 'Day 5',
    treatmentLabel: 'of a Frozen Embryo Transfer',
    encouragement: "One step closer — you've got this.",
    nextDose: { time: '8am', medication: 'Progesterone', detail: '200mg capsule' },
    labTest: { dateTime: 'Thursday, Oct. 2 | 9:00am', location: 'Lakeshore Fertility Center' },
    delivery: { dateTime: 'Thursday, Oct. 2 | 5:00pm', detail: '1 medication is coming today.' },
  },
}

// ---------------------------------------------------------------------------
// Pals

type SeedPal = { person: Person; profile: PalProfile }

export const pals: SeedPal[] = [
  {
    person: { id: 'pal-elena', displayName: 'Elena', usesAlias: false, avatarUrl: avatarElena, kind: 'patient', age: 36 },
    profile: {
      personId: 'pal-elena',
      story: {
        aboutMe: "IVF mom of one, here for the hard days. Two cycles in, I learned it's okay to not be okay — happy to sit with you in that.",
        whereIWas: 'Two failed IVF cycles before our daughter.',
        whatHelpedMe: "Someone who'd normalize how angry I felt.",
        whatICanOffer: 'Honest talk about the two-week wait.',
      },
      experience: ['IVF', 'FET'],
      capacity: 3,
      activeCount: 1,
      availability: 'available',
      typicalReplyHours: 20,
      lastActiveAt: daysAgo(0.4),
      supportedCount: 6,
    },
  },
  {
    person: { id: 'pal-priya', displayName: 'Priya', usesAlias: false, avatarUrl: avatarPriya, kind: 'patient', age: 33 },
    profile: {
      personId: 'pal-priya',
      story: {
        aboutMe: 'Three-time FET veteran — the third one finally worked. Ask me anything, especially about the wait between transfer and testing.',
        whereIWas: 'Three rounds of FET before one finally worked.',
        whatHelpedMe: 'Someone who didn’t rush me toward hope.',
        whatICanOffer: 'What to expect between transfer and testing.',
      },
      experience: ['FET', 'ICSI'],
      capacity: 4,
      activeCount: 2,
      availability: 'available',
      typicalReplyHours: 10,
      lastActiveAt: daysAgo(0.1),
      supportedCount: 9,
    },
  },
  {
    person: { id: 'pal-grace', displayName: 'Grace', usesAlias: false, avatarUrl: avatarGrace, kind: 'employee', age: 41 },
    profile: {
      personId: 'pal-grace',
      story: {
        aboutMe: 'Pixel Care team member and FET Pal. I went through my own gestational carrier journey and two rounds of FET, so I get both sides of this.',
        whereIWas: 'A gestational carrier journey, then two rounds of FET of my own.',
        whatHelpedMe: 'Having someone to ask the “dumb” questions.',
        whatICanOffer: 'A steady, unhurried ear — most days I can reply fast.',
      },
      experience: ['FET', 'IVF', 'IUI', 'GESTATIONAL_CARRIER'],
      capacity: 12,
      activeCount: 5,
      availability: 'available',
      typicalReplyHours: 5,
      lastActiveAt: daysAgo(0.02),
      supportedCount: 31,
    },
  },
  {
    person: { id: 'pal-dana', displayName: 'Dana', usesAlias: false, avatarUrl: avatarDana, kind: 'patient', age: 29 },
    profile: {
      personId: 'pal-dana',
      story: {
        aboutMe: 'IUI and early-IVF questions welcome. I remember how confusing those first decisions were — happy to walk through them with you.',
        whereIWas: 'Two rounds of IUI before we moved on to IVF.',
        whatHelpedMe: 'Someone who let me be angry without trying to fix it.',
        whatICanOffer: 'Support for the early, confusing decisions.',
      },
      experience: ['IUI'],
      capacity: 3,
      activeCount: 0,
      availability: 'available',
      typicalReplyHours: 30,
      lastActiveAt: daysAgo(2),
      supportedCount: 2,
    },
  },
  {
    // Full — proves the exclusion rule (no headroom).
    person: { id: 'pal-monica', displayName: 'Monica', usesAlias: false, avatarUrl: avatarMonica, kind: 'patient', age: 35 },
    profile: {
      personId: 'pal-monica',
      story: {
        aboutMe: 'FET twice, both successful. Currently full up, but I still like hearing how people are doing.',
        whereIWas: 'Two rounds of FET, both successful.',
        whatHelpedMe: 'A Pal who checked in without being asked.',
        whatICanOffer: 'Calm, practical FET support — when I have room.',
      },
      experience: ['FET', 'IVF'],
      capacity: 3,
      activeCount: 3,
      availability: 'available',
      typicalReplyHours: 12,
      lastActiveAt: daysAgo(0.3),
      supportedCount: 11,
    },
  },
  {
    // Not taking new — proves the exclusion rule (not currently reachable
    // for a fresh match, though her one existing conversation stays live).
    person: { id: 'pal-beth', displayName: 'Beth', usesAlias: false, avatarUrl: avatarBeth, kind: 'patient', age: 38 },
    profile: {
      personId: 'pal-beth',
      story: {
        aboutMe: 'FET Pal, not taking on anyone new right now. I’ll be back — in the meantime I hope you find someone with the bandwidth to match.',
        whereIWas: 'FET after a failed fresh transfer.',
        whatHelpedMe: 'Not being the only one who understood the wait.',
        whatICanOffer: 'Support, once I’m taking new people again.',
      },
      experience: ['FET'],
      capacity: 3,
      activeCount: 1,
      availability: 'not_taking_new',
      typicalReplyHours: 24,
      lastActiveAt: daysAgo(9),
      supportedCount: 4,
    },
  },
  {
    // Alias — real name withheld, patient's choice (spec §5/§6).
    // Alias, so no real photo either — a face identifies her more than her
    // withheld name would (see `usesAlias` on Person). `avatarUrl` stays
    // empty on purpose; Avatar.tsx's initials fallback is the right
    // treatment here, not an oversight.
    person: { id: 'pal-wren', displayName: 'Wren', usesAlias: true, avatarUrl: '', kind: 'patient', age: 31 },
    profile: {
      personId: 'pal-wren',
      story: {
        aboutMe: 'ICSI, twice — the second right after a miscarriage. Ask me the scary questions; I promise not to flinch.',
        whereIWas: 'Two rounds of ICSI, the second one right after a miscarriage.',
        whatHelpedMe: 'Someone who didn’t tell me it would “definitely work this time.”',
        whatICanOffer: 'Company for the injection anxiety, no toxic positivity.',
      },
      experience: ['ICSI', 'IVF'],
      capacity: 3,
      activeCount: 2,
      availability: 'available',
      typicalReplyHours: 14,
      lastActiveAt: daysAgo(0.5),
      supportedCount: 7,
    },
  },
  {
    person: { id: 'pal-farrah', displayName: 'Farrah', usesAlias: false, avatarUrl: avatarFarrah, kind: 'patient', age: 27 },
    profile: {
      personId: 'pal-farrah',
      story: {
        aboutMe: 'Froze my eggs solo at 27, no partner in the picture yet. Happy to compare notes on the cost, the hormones, and doing it alone.',
        whereIWas: 'Froze my eggs alone at 27, no partner in the picture yet.',
        whatHelpedMe: 'Someone who didn’t make it about “finding the one” first.',
        whatICanOffer: 'Real talk about the cost, the hormones, and doing it solo.',
      },
      experience: ['EGG_FREEZING'],
      capacity: 3,
      activeCount: 1,
      availability: 'available',
      typicalReplyHours: 8,
      lastActiveAt: daysAgo(0.1),
      supportedCount: 3,
    },
  },
  {
    person: { id: 'pal-olivia', displayName: 'Olivia', usesAlias: false, avatarUrl: avatarOlivia, kind: 'patient', age: 44 },
    profile: {
      personId: 'pal-olivia',
      story: {
        aboutMe: 'Donor-egg parent, three years in. It took me a while to feel like this was “mine” — glad to talk through that whenever you’re ready.',
        whereIWas: 'Needed donor eggs after years of unexplained loss.',
        whatHelpedMe: 'Time — and someone who didn’t rush that part.',
        whatICanOffer: 'A slower, no-pressure ear for the identity questions donor eggs bring up.',
      },
      experience: ['DONOR_EGG', 'IVF'],
      capacity: 2,
      activeCount: 1,
      availability: 'available',
      typicalReplyHours: 40,
      lastActiveAt: daysAgo(25),
      supportedCount: 5,
    },
  },
  {
    person: { id: 'pal-tessa', displayName: 'Tessa', usesAlias: false, avatarUrl: avatarTessa, kind: 'patient', age: 39 },
    profile: {
      personId: 'pal-tessa',
      story: {
        aboutMe: 'Gestational carrier and donor sperm journey, now raising our son. Happy to talk about the parts of this most people don’t think to ask about.',
        whereIWas: 'Worked with a gestational carrier and donor sperm to have our son.',
        whatHelpedMe: 'Talking to someone who understood the legal stuff wasn’t the hard part.',
        whatICanOffer: 'Perspective on the parts of this journey people don’t ask about.',
      },
      experience: ['GESTATIONAL_CARRIER', 'DONOR_SPERM'],
      capacity: 3,
      activeCount: 2,
      availability: 'available',
      typicalReplyHours: 18,
      lastActiveAt: daysAgo(1),
      supportedCount: 8,
    },
  },
  {
    // Full — the second Pal proving the exclusion rule.
    person: { id: 'pal-ruth', displayName: 'Ruth', usesAlias: false, avatarUrl: avatarRuth, kind: 'patient', age: 30 },
    profile: {
      personId: 'pal-ruth',
      story: {
        aboutMe: 'OI and IUI, before it finally worked. I know the early stretch gets dismissed as “the easy part” — it wasn’t, and I don’t treat it that way.',
        whereIWas: 'Ovulation induction, then IUI, before it worked.',
        whatHelpedMe: 'Someone who treated the “simpler” treatments as still hard.',
        whatICanOffer: 'Company for the early, easy-to-dismiss stages.',
      },
      experience: ['OI', 'IUI'],
      capacity: 2,
      activeCount: 2,
      availability: 'available',
      typicalReplyHours: 22,
      lastActiveAt: daysAgo(0.6),
      supportedCount: 6,
    },
  },
  {
    // Graduated Samantha's earlier IVF cycle, now taking a break by choice.
    person: { id: 'pal-whitney', displayName: 'Whitney', usesAlias: false, avatarUrl: avatarWhitney, kind: 'patient', age: 34 },
    profile: {
      personId: 'pal-whitney',
      story: {
        aboutMe: 'PGT and IVF Pal, one cycle in the books. Resting up for a bit right now, but always glad to hear how a first cycle is going.',
        whereIWas: 'One IVF cycle, one very anxious two-week wait.',
        whatHelpedMe: 'A Pal who checked in the morning of my retrieval, unprompted.',
        whatICanOffer: 'Steady company through a first cycle — taking a short break right now.',
      },
      experience: ['PGT', 'IVF'],
      capacity: 3,
      activeCount: 0,
      availability: 'not_taking_new',
      typicalReplyHours: 16,
      lastActiveAt: daysAgo(60),
      supportedCount: 5,
    },
  },
  // --- FET bench -----------------------------------------------------------
  // Five Pals list FET, but two of them are the exclusion fixtures (Monica
  // full, Beth not taking new), which left exactly three eligible for Samantha's FET
  // request — precisely the shortlist size. "Not for me" then had nothing to
  // backfill with, and the first decline dropped her straight into the
  // thin-supply banner, which reads as the matching being broken rather than
  // the roster being small. These three exist to give that pool depth, so a
  // decline does the ordinary thing and the banner stays the edge case it
  // was written to be (see `simulateThinSupply`).
  {
    person: { id: 'pal-leila', displayName: 'Leila', usesAlias: false, avatarUrl: avatarLeila, kind: 'patient', age: 37 },
    profile: {
      personId: 'pal-leila',
      story: {
        aboutMe: 'Two FETs, one miscarriage in between, one daughter at the end of it. I talk about the middle part more than most people want to.',
        whereIWas: 'A failed first transfer, then a loss at nine weeks, then a second transfer that held.',
        whatHelpedMe: 'Someone who did not tell me to stay positive.',
        whatICanOffer: 'Honest company through a transfer after a loss.',
      },
      experience: ['FET', 'IVF'],
      capacity: 3,
      activeCount: 1,
      availability: 'available',
      typicalReplyHours: 6,
      lastActiveAt: daysAgo(0.5),
      supportedCount: 6,
    },
  },
  {
    // No photo — the initials fallback is a first-class state (Avatar.tsx,
    // spec §6), not a gap to be filled with a stock face.
    person: { id: 'pal-sofia', displayName: 'Sofia', usesAlias: false, avatarUrl: '', kind: 'patient', age: 32 },
    profile: {
      personId: 'pal-sofia',
      story: {
        aboutMe: 'FET after two rounds of IUI that went nowhere. Currently very into the fact that nobody warned me about the waiting.',
        whereIWas: 'Two IUIs, then straight to a frozen transfer.',
        whatHelpedMe: 'Practical detail. What the appointment is actually like, minute by minute.',
        whatICanOffer: 'The unglamorous logistics — meds, timings, what to ask for.',
      },
      experience: ['FET', 'IUI'],
      // Near capacity on purpose. Headroom is the third ranking factor, so a
      // wide-open new Pal would outrank the established ones and lead the
      // shortlist — and these two have no photo, which is the wrong trade on
      // M4, where a real face is the whole point of the card. Kept tight so
      // they arrive as backfill once someone is declined, not as the first
      // impression.
      capacity: 4,
      activeCount: 3,
      availability: 'available',
      typicalReplyHours: 24,
      lastActiveAt: daysAgo(1),
      supportedCount: 3,
    },
  },
  {
    person: { id: 'pal-marta', displayName: 'Marta', usesAlias: false, avatarUrl: '', kind: 'patient', age: 40 },
    profile: {
      personId: 'pal-marta',
      story: {
        aboutMe: 'Three transfers over four years. Still here, still glad to talk to anyone in the middle of it.',
        whereIWas: 'Three FETs, two of them before I had any idea what I was doing.',
        whatHelpedMe: 'Being allowed to be angry about it without anyone trying to fix me.',
        whatICanOffer: 'Long-haul perspective, especially if this is not your first transfer.',
      },
      experience: ['FET', 'ICSI'],
      // Same reasoning as Sofia above — deliberately tight headroom.
      capacity: 3,
      activeCount: 2,
      availability: 'available',
      typicalReplyHours: 48,
      lastActiveAt: daysAgo(2),
      supportedCount: 9,
    },
  },
]

export function personFor(personId: string): Person {
  const found = pals.find((p) => p.person.id === personId)?.person ?? members.find((m) => m.id === personId)
  if (!found) throw new Error(`No seeded person for id ${personId}`)
  return found
}

export function profileFor(personId: string): PalProfile {
  const found = pals.find((p) => p.person.id === personId)?.profile
  if (!found) throw new Error(`No seeded profile for id ${personId}`)
  return found
}

// ---------------------------------------------------------------------------
// Member requests

export const samanthaRequest: MemberRequest = {
  id: 'request-samantha-1',
  memberId: 'member-samantha',
  treatments: ['FET'],
  needs: ['same_treatment', 'emotional_side'],
  createdAt: daysAgo(0.02),
}

export const memberRequests: MemberRequest[] = [
  samanthaRequest,
  {
    id: 'request-maya-1',
    memberId: 'member-maya',
    treatments: ['ICSI'],
    needs: ['same_treatment', 'emotional_side'],
    note: 'Starting my first cycle and pretty scared of the injections.',
    createdAt: daysAgo(20),
  },
  {
    id: 'request-firefly-1',
    memberId: 'member-firefly',
    treatments: ['DONOR_EGG'],
    needs: ['emotional_side', 'further_along'],
    createdAt: daysAgo(40),
  },
  // Pal-side counterparties — these back the two incoming requests below.
  // The Pal sees exactly this: what she's going through, what would help,
  // and the intro note. That's what makes accept/decline informed (A3).
  {
    id: 'request-nadia-1',
    memberId: 'member-nadia',
    treatments: ['FET'],
    needs: ['same_treatment', 'emotional_side'],
    note: 'Second transfer after a failed one. Trying not to spiral this time.',
    createdAt: daysAgo(0.3),
  },
  {
    id: 'request-jo-1',
    memberId: 'member-jo',
    treatments: ['IVF'],
    needs: ['emotional_side', 'further_along'],
    createdAt: daysAgo(1.2),
  },
]

// ---------------------------------------------------------------------------
// Relationships — active / quiet / graduated (member side), plus two pending
// requests waiting on the Pal side.

export const relationships: Relationship[] = [
  // --- Pal side ------------------------------------------------------------
  // Two members waiting on Jordan-as-a-Pal (the Pal-journey protagonist —
  // see the `members` comment above). They sit here from the start but only
  // surface once her application reaches `active` — a Pal with a pending
  // application has no queue, and showing one would undo the point of
  // making application status explicit (workshop §6.5 step 2).
  {
    id: 'rel-nadia-jordan',
    memberId: 'member-nadia',
    palId: 'member-jordan',
    state: 'pending',
    introNote:
      "Hi — I'm going in for my second transfer in two weeks. The first one didn't take and I've been dreading this one since. How did you get through the waiting part?",
    sharedContext: "You've both been through FET.",
    createdAt: daysAgo(0.3),
    lastMessageAt: daysAgo(0.3),
    milestoneSharing: { enabled: false, items: [] },
    messages: [
      {
        id: 'msg-ns-1',
        senderId: 'member-nadia',
        kind: 'text',
        sentAt: daysAgo(0.3),
        body: "Hi — I'm going in for my second transfer in two weeks. The first one didn't take and I've been dreading this one since. How did you get through the waiting part?",
      },
    ],
  },
  {
    id: 'rel-jo-jordan',
    memberId: 'member-jo',
    palId: 'member-jordan',
    state: 'pending',
    introNote:
      "Starting IVF next month and I haven't told anyone except my partner. Mostly I'd just like to talk to someone who isn't going to tell me to relax.",
    sharedContext: "You've both been through IVF.",
    createdAt: daysAgo(1.2),
    lastMessageAt: daysAgo(1.2),
    milestoneSharing: { enabled: false, items: [] },
    messages: [
      {
        id: 'msg-js-1',
        senderId: 'member-jo',
        kind: 'text',
        sentAt: daysAgo(1.2),
        body: "Starting IVF next month and I haven't told anyone except my partner. Mostly I'd just like to talk to someone who isn't going to tell me to relax.",
      },
    ],
  },

  // --- Member side ---------------------------------------------------------
  {
    id: 'rel-maya-wren',
    memberId: 'member-maya',
    palId: 'pal-wren',
    state: 'active',
    introNote:
      "Hi Wren, I'm about to start my first ICSI cycle and I'm terrified of the injections. Would love to talk to someone who's been through it.",
    sharedContext: "You've both been through ICSI.",
    createdAt: daysAgo(20),
    lastMessageAt: daysAgo(0.3),
    milestoneSharing: { enabled: false, items: [] },
    messages: [
      {
        id: 'msg-mw-1',
        senderId: 'member-maya',
        kind: 'text',
        sentAt: daysAgo(20),
        body: "Hi Wren, I'm about to start my first ICSI cycle and I'm terrified of the injections. Would love to talk to someone who's been through it.",
      },
      {
        id: 'msg-mw-2',
        senderId: 'pal-wren',
        kind: 'text',
        sentAt: daysAgo(19.8),
        body: 'Hi Maya, sending you a hug. The injections looked so much worse in my head than they were — happy to walk you through what actually helped me.',
      },
      {
        id: 'msg-mw-3',
        senderId: 'member-maya',
        kind: 'text',
        sentAt: daysAgo(19.5),
        body: 'That would mean a lot. Did you have a routine that made it less awful?',
      },
      {
        id: 'msg-mw-4',
        senderId: 'pal-wren',
        kind: 'text',
        sentAt: daysAgo(19.4),
        body: "I numbed the spot with ice for a minute first, and did it right before bed so I could just fall asleep after. Also — it's okay to cry over it, I did plenty.",
      },
      {
        id: 'msg-mw-5',
        senderId: 'member-maya',
        kind: 'text',
        sentAt: daysAgo(12),
        body: 'Okay, that helps so much. Starting stims tomorrow.',
      },
      {
        id: 'msg-mw-6',
        senderId: 'pal-wren',
        kind: 'checkin',
        sentAt: daysAgo(11.9),
        body: 'Thinking of you today.',
      },
      {
        id: 'msg-mw-7',
        senderId: 'member-maya',
        kind: 'text',
        sentAt: daysAgo(11.8),
        body: 'First injection done! Barely felt it, thank you for the ice tip.',
      },
      {
        id: 'msg-mw-8',
        senderId: 'pal-wren',
        kind: 'text',
        sentAt: daysAgo(0.3),
        body: "So proud of you. One down, keep me posted on how you're feeling.",
      },
    ],
  },
  {
    id: 'rel-firefly-olivia',
    memberId: 'member-firefly',
    palId: 'pal-olivia',
    state: 'quiet',
    introNote:
      "Hi Olivia, I'm just starting to look into donor eggs and honestly feeling really overwhelmed. Could use someone who's been there.",
    sharedContext: "You've both used donor eggs.",
    createdAt: daysAgo(40),
    lastMessageAt: daysAgo(25),
    milestoneSharing: { enabled: false, items: [] },
    messages: [
      {
        id: 'msg-fo-1',
        senderId: 'member-firefly',
        kind: 'text',
        sentAt: daysAgo(40),
        body: "Hi Olivia, I'm just starting to look into donor eggs and honestly feeling really overwhelmed. Could use someone who's been there.",
      },
      {
        id: 'msg-fo-2',
        senderId: 'pal-olivia',
        kind: 'text',
        sentAt: daysAgo(39.7),
        body: "Hi Firefly, I remember that overwhelmed feeling so well. I'm glad you reached out — ask me anything, there's no dumb question here.",
      },
      {
        id: 'msg-fo-3',
        senderId: 'member-firefly',
        kind: 'text',
        sentAt: daysAgo(26),
        body: "Thank you. I think my biggest fear is that it won't feel like 'mine.' Did you feel that way?",
      },
      {
        id: 'msg-fo-4',
        senderId: 'pal-olivia',
        kind: 'text',
        sentAt: daysAgo(25),
        body: "I did, especially at first. It shifted for me somewhere around the first ultrasound — I'm happy to talk through it when you're ready.",
      },
    ],
  },
  {
    id: 'rel-samantha-whitney',
    memberId: 'member-samantha',
    palId: 'pal-whitney',
    state: 'graduated',
    introNote:
      "Hi Whitney, I just started my first IVF cycle and I don't really know anyone else going through this. Would love to talk.",
    sharedContext: "You've both been through IVF.",
    createdAt: daysAgo(210),
    lastMessageAt: daysAgo(58),
    milestoneSharing: { enabled: false, items: [] },
    messages: [
      {
        id: 'msg-sw-1',
        senderId: 'member-samantha',
        kind: 'text',
        sentAt: daysAgo(210),
        body: "Hi Whitney, I just started my first IVF cycle and I don't really know anyone else going through this. Would love to talk.",
      },
      {
        id: 'msg-sw-2',
        senderId: 'pal-whitney',
        kind: 'text',
        sentAt: daysAgo(209.8),
        body: "Hi Samantha, welcome — I promise it gets more familiar. I'm here for whatever you need, venting included.",
      },
      {
        id: 'msg-sw-3',
        senderId: 'member-samantha',
        kind: 'text',
        sentAt: daysAgo(205),
        body: 'Thank you, that means a lot already.',
      },
      {
        id: 'msg-sw-4',
        senderId: 'pal-whitney',
        kind: 'checkin',
        sentAt: daysAgo(190),
        body: 'Thinking of you before your retrieval today.',
      },
      {
        id: 'msg-sw-5',
        senderId: 'member-samantha',
        kind: 'text',
        sentAt: daysAgo(189.8),
        body: "It went okay! Tired but relieved it's over.",
      },
      {
        id: 'msg-sw-6',
        senderId: 'pal-whitney',
        kind: 'text',
        sentAt: daysAgo(189.5),
        body: 'So glad to hear it. Rest up, you did the hard part.',
      },
      {
        id: 'msg-sw-7',
        senderId: 'member-samantha',
        kind: 'text',
        sentAt: daysAgo(58.2),
        body: "Whitney — we got a positive test. I don't think I could have gotten through the wait without you.",
      },
      {
        id: 'msg-sw-8',
        senderId: 'pal-whitney',
        kind: 'text',
        sentAt: daysAgo(58),
        body: 'I am so, so happy for you. This is exactly why I do this. Wishing you the calmest rest of the way.',
      },
    ],
  },
]
