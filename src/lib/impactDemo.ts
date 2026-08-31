import type { Message, Person, Relationship } from './types'
import { relationships as seedRelationships } from './seed'

/**
 * Demo data for the Pal Home "Your Impact" card's four content states —
 * prototype/client-presentation only, not part of the product's data model.
 * `useDemoStore.setPalImpactDemoState` is the only caller; see the doc
 * comment there for why this rewrites real relationship/person records
 * instead of faking numbers on the card itself.
 *
 * `nadiaMessages`/`NADIA_THANK_YOU` are also reused by
 * `useDemoStore.simulateNadiaGraduates` (the "SIMULATE GRADUATION" demo
 * controls) — same realistic Nadia/Jordan conversation, just as the seed
 * for a live active→graduated transition rather than a static snapshot.
 *
 * `empty`/`one`/`one_thankyou` all reuse Jordan's real seeded Nadia
 * relationship (`rel-nadia-jordan`) rather than a synthetic stand-in — she's
 * already the pending request waiting on Jordan in `seed.ts`, so "graduating"
 * her here reads as the same relationship reaching its natural conclusion,
 * not a second unrelated Nadia appearing. `four` keeps her and adds three
 * more, each a fabricated member (Renee/Yasmin/Camille) who exist only for
 * this state.
 */

export type ImpactDemoState = 'empty' | 'one' | 'one_thankyou' | 'four'

export const NADIA_THANK_YOU = 'Thank you for being honest with me when I really needed someone who understood.'

const seedNadiaRelationship = seedRelationships.find((r) => r.id === 'rel-nadia-jordan')

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()
}

let seq = 0
function msg(senderId: string, sentAtDaysAgo: number, body: string, kind: Message['kind'] = 'text'): Message {
  seq += 1
  return { id: `msg-impact-demo-${seq}`, senderId, body, kind, sentAt: daysAgo(sentAtDaysAgo) }
}

function relationshipFrom(id: string, memberId: string, sharedContext: string, messages: Message[]): Relationship {
  const last = messages[messages.length - 1]
  return {
    id,
    memberId,
    palId: 'member-jordan',
    state: 'graduated',
    introNote: messages[0].body,
    messages,
    sharedContext,
    createdAt: messages[0].sentAt,
    lastMessageAt: last.sentAt,
    milestoneSharing: { enabled: false, items: [] },
    // Already "seen" — these are steady-state Impact-card snapshots, not a
    // simulation of a fresh graduation, so they must never light up the
    // unread "New" marker or the Home graduation card (that's
    // `simulateNadiaGraduates`'s job, a different demo control entirely).
    graduationSeenAt: last.sentAt,
  }
}

export function nadiaMessages(): Message[] {
  const m = 'member-nadia'
  const p = 'member-jordan'
  return [
    msg(
      m,
      21,
      "Hi — I'm going in for my second transfer in two weeks. The first one didn't take and I've been dreading this one since. How did you get through the waiting part?",
    ),
    msg(
      p,
      20.8,
      "Hi Nadia, I'm really glad you reached out. The two-week wait after my own transfer was the hardest part too — I'll be right here with you through it.",
    ),
    msg(
      p,
      20.5,
      "If it helps, I'm happy to walk you through what actually got me through the morning of my transfer, logistics and all.",
    ),
    msg(m, 20.3, "That helps just to hear. I keep replaying the first one failing."),
    msg(
      p,
      20.0,
      "That makes complete sense — you're allowed to feel the whole thing this time, not just the hopeful part.",
    ),
    msg(m, 18, "Transfer's done. Now the wait begins I guess."),
    msg(
      p,
      17.8,
      'You did it. However you want to spend the next two weeks — distracted, quiet, checking in with me — all of it is the right way.',
    ),
    msg(p, 16, 'Thinking of you before your appointment tomorrow.', 'checkin'),
    msg(p, 14, 'Thinking of you today.', 'checkin'),
    msg(m, 13, "Still here, still waiting. Trying not to symptom-spot but failing a little."),
    msg(p, 12.8, "Totally normal to fail at that — I refreshed my search history for two weeks straight last time."),
    msg(m, 12, "That actually makes me feel so much better, thank you."),
    msg(p, 11.8, "Any time. Whatever this one does, I'm glad you had someone to wait with."),
    msg(p, 10, "Thinking about you today — how's the waiting treating you?"),
    msg(p, 6, 'Thinking of you this morning.', 'checkin'),
    msg(p, 4, 'How are you holding up?'),
    msg(p, 3, "Not gonna lie, I've been thinking about you all week."),
    msg(m, 2, "Test day is tomorrow. Nervous doesn't cover it."),
    msg(p, 1.8, 'Whatever the number says tomorrow, you did everything right getting here. Sending you so much.'),
    msg(m, 1, "It's positive. I don't even know what to say."),
    msg(p, 0.9, "I'm so happy for you, Nadia. Truly."),
  ]
}

function reneeMessages(): Message[] {
  const m = 'member-renee'
  const p = 'member-jordan'
  return [
    msg(
      m,
      55,
      'Hi — starting my second round of IUI next week and honestly just feeling defeated already. Could use someone who gets it.',
    ),
    msg(
      p,
      54.8,
      "Hi Renee, the second round has its own kind of hard, doesn't it — less naive, more braced. I'm glad you're here.",
    ),
    msg(m, 50, "That's exactly it. I don't know how to hope again without setting myself up."),
    msg(p, 49.8, "You don't have to hope big to keep going. Small hope counts too — I promise it's enough."),
    msg(p, 48, 'Thinking of you — how is the monitoring going?', 'checkin'),
    msg(m, 45, "Slower than I hoped, but moving. Trigger's been pushed a few days."),
    msg(p, 44.8, "That's frustrating, but it's still moving. I'll be here whenever the shot finally happens."),
    msg(p, 38, 'Saw the days going by — how are you holding up?', 'checkin'),
    msg(m, 37, "Trigger shot's tomorrow, finally."),
    msg(p, 36.8, "You've got this. Text me after if you want, or don't — either is fine."),
    msg(m, 30, "It worked. I'm still in shock."),
    msg(p, 29.8, 'I am so, so happy for you, Renee. This is exactly why I do this.'),
  ]
}

function yasminMessages(): Message[] {
  const m = 'member-yasmin'
  const p = 'member-jordan'
  return [
    msg(m, 90, "Hi — starting ICSI in a few weeks and terrified of the injections if I'm honest."),
    msg(
      p,
      89.8,
      "Hi Yasmin, that fear is so normal — happy to walk you through what actually helped me if that's useful.",
    ),
    msg(m, 85, "Yes please. Everyone keeps telling me it's fine and it's not helping."),
    msg(
      p,
      84.8,
      "It's not 'fine' — it's hard, and you're allowed to say so. Ice the spot first, and it helps to have something dumb on TV after.",
    ),
    msg(p, 80, 'How did the first shot go?', 'checkin'),
    msg(m, 79, 'Better than I built it up to be, honestly.'),
    msg(p, 78.8, "That's usually how it goes. Onward."),
    msg(m, 70, 'Did the retrieval yesterday. Sore but okay.'),
    msg(p, 69, 'Thinking of you today — rest as much as you can.', 'checkin'),
    msg(m, 55, 'Transfer is done. Now waiting.'),
    msg(p, 54.8, "The waiting is its own thing entirely. I'm here for all of it, however it goes."),
    msg(p, 50, "How's the two-week wait treating you?", 'checkin'),
    msg(m, 40, 'We got our positive test this morning.'),
    msg(p, 39.8, "I'm so happy for you. Truly — you did everything right getting here."),
  ]
}

function camilleMessages(): Message[] {
  const m = 'member-camille'
  const p = 'member-jordan'
  return [
    msg(m, 130, "Hi — just started my first IVF cycle and don't really know anyone else going through this."),
    msg(
      p,
      129.8,
      "Hi Camille, welcome — I promise it gets more familiar. I'm here for whatever you need, venting included.",
    ),
    msg(m, 120, 'Today was rough. Retrieval did not get as many eggs as we hoped.'),
    msg(
      p,
      119.8,
      "That's a real loss to sit with, even with the ones you do have. I'm sorry — however you feel about it is fair.",
    ),
    msg(p, 115, 'Thinking of you as the results come in.', 'checkin'),
    msg(m, 110, 'Fertilization report is in — better than yesterday felt.'),
    msg(p, 109.8, "That's genuinely good news. Let yourself feel that."),
    msg(m, 100, 'Transfer went okay. Trying to stay calm.'),
    msg(p, 95, 'Thinking of you before your test.', 'checkin'),
    msg(m, 90, 'It is a yes. I keep re-reading the message.'),
    msg(p, 89.8, 'I am so happy for you, Camille. Read it as many times as you want.'),
  ]
}

export const IMPACT_DEMO_PEOPLE: Person[] = [
  { id: 'member-renee', displayName: 'Renee', usesAlias: false, avatarUrl: '', kind: 'patient', age: 33 },
  { id: 'member-yasmin', displayName: 'Yasmin', usesAlias: false, avatarUrl: '', kind: 'patient', age: 30 },
  { id: 'member-camille', displayName: 'Camille', usesAlias: false, avatarUrl: '', kind: 'patient', age: 38 },
]

export const IMPACT_DEMO_RELATIONSHIP_IDS = [
  'rel-nadia-jordan',
  'demo-impact-renee',
  'demo-impact-yasmin',
  'demo-impact-camille',
]

export const IMPACT_DEMO_PERSON_IDS = IMPACT_DEMO_PEOPLE.map((p) => p.id)

export function buildImpactDemo(target: ImpactDemoState): {
  relationships: Relationship[]
  people: Person[]
  supportedCount: number
} {
  if (target === 'empty' || !seedNadiaRelationship) {
    return { relationships: seedNadiaRelationship ? [seedNadiaRelationship] : [], people: [], supportedCount: 0 }
  }

  const withThankYou = target === 'one_thankyou' || target === 'four'
  const nadia: Relationship = {
    ...relationshipFrom('rel-nadia-jordan', 'member-nadia', "You've both been through FET.", nadiaMessages()),
    thankYouNote: withThankYou ? NADIA_THANK_YOU : undefined,
  }

  if (target !== 'four') {
    return { relationships: [nadia], people: [], supportedCount: 1 }
  }

  const renee = relationshipFrom('demo-impact-renee', 'member-renee', "You've both been through IUI.", reneeMessages())
  const yasmin = relationshipFrom(
    'demo-impact-yasmin',
    'member-yasmin',
    "You've both been through ICSI.",
    yasminMessages(),
  )
  const camille = relationshipFrom(
    'demo-impact-camille',
    'member-camille',
    "You've both been through IVF.",
    camilleMessages(),
  )

  return {
    relationships: [nadia, renee, yasmin, camille],
    people: IMPACT_DEMO_PEOPLE,
    supportedCount: 4,
  }
}
