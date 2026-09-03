/**
 * Mocked, privacy-friendly Pixel Pal for the V2 "Match found" prototype
 * branch — an alias and a non-identifying avatar (no `src`, so `Avatar`
 * falls back to initials), not a real matched person. There is no real
 * matching algorithm behind this yet — see docs/pixel-pal-v2-source-of-truth.md.
 *
 * `aboutMe` is deliberately a neutral Social Profile line, not a treatment
 * detail: the Main App may use treatment info for matching, but exact
 * treatment disclosure to a Pixel Pal isn't a confirmed product rule yet —
 * see that doc's Treatment privacy section. Nothing referencing this fixture
 * should name a specific treatment.
 *
 * Shared between `PixelPalMatchFound` (the profile screen) and
 * `PixelPalChat` (the first-contact thread "Say hello" opens) so both read
 * the same identity rather than keeping two copies of it.
 */
export const mockMatch = {
  alias: 'River',
  aboutMe: 'Dog person, amateur baker, and always looking for a good series.',
}
