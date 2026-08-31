import type { PalProfile } from './types'

/**
 * `aboutMe` is required by the application form — `ApplyStory.tsx` won't
 * let her continue without it — and every seeded Pal has one. But it's a
 * field that was added after the story shape already existed, so a profile
 * saved before that requirement was in place (stale persisted demo state,
 * mainly) can still be missing it.
 *
 * Rather than show a blank gap where the card's one prose line belongs,
 * fall back to her own words from elsewhere in the story. Never invented
 * text — just the next-best thing she actually wrote, same honesty rule
 * `rankPals.ts` holds its reasons to.
 */
export function aboutMeOrFallback(story: PalProfile['story']): string {
  return story.aboutMe || story.whatICanOffer || story.whereIWas
}
