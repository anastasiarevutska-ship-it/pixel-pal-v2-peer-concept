type QuietThreadNoticeProps = {
  /** The other person in the thread — the Pal's name on the member's side,
   *  the member's name on the Pal's. */
  otherName: string
  lastMessageAt?: string
}

/**
 * Softens `quiet` — the state a thread falls into after ~21 silent days
 * (spec §5 `Relationship.state`, workshop §D8/§6.7).
 *
 * The whole point of the state is that **dormancy is not failure**
 * (workshop C7: "most relationships fade rather than terminate — design
 * for graceful dormancy, not binary closure"). So this is an open door,
 * never a nudge about neglect: it names the gap honestly, then hands back
 * the lowest-effort way in. "A check-in is enough" points at the Check in
 * control already in the composer rather than duplicating it — the whole
 * problem it solves is people going quiet because they can't face writing
 * something adequate (workshop §5 C2).
 *
 * Rendered on both sides, identically — symmetry is a rule of this
 * concept, not a preference (workshop §6.3), and §6.4 step 9 asks for the
 * re-open affordance "on both sides" explicitly.
 */
export function QuietThreadNotice({ otherName, lastMessageAt }: QuietThreadNoticeProps) {
  return (
    <div className="mb-4 rounded-field bg-yellow-40 px-3 py-2 text-center text-body-sm text-navy-80">
      You and {otherName} haven&rsquo;t spoken in {quietFor(lastMessageAt)}. Pick it up whenever
      you&rsquo;re ready — a check-in is enough.
    </div>
  )
}

/**
 * Deliberately vague. An exact day count on a silent thread reads as a
 * counter tallying how long you've left someone waiting, which is the one
 * thing this notice must not do.
 */
function quietFor(since?: string): string {
  if (!since) return 'a while'
  const days = Math.floor((Date.now() - new Date(since).getTime()) / 86_400_000)
  if (!Number.isFinite(days)) return 'a while'
  if (days >= 60) return 'a couple of months'
  if (days >= 30) return 'over a month'
  return 'a few weeks'
}
