/**
 * Reply-time expectation — one canonical list, picked by the Pal herself at
 * application time (P4.5) rather than assumed. Feeds `PalProfile.typicalReplyHours`,
 * which `rankPals.ts` already uses for responsiveness scoring — this file only adds
 * the human-facing picker and label, not a new signal.
 */
export const replyTimeframes: { hours: number; label: string }[] = [
  { hours: 2, label: 'Within a couple of hours' },
  { hours: 24, label: 'Within a day' },
  { hours: 48, label: 'Within 2 days' },
  { hours: 72, label: 'Within a few days' },
]

/** Nearest bucket at or above the given hours — works for any numeric value,
 * whether it came from the picker above or from older, finer-grained seed data. */
export function replyTimeframeLabel(hours: number): string {
  const match = replyTimeframes.find((t) => hours <= t.hours)
  return (match ?? replyTimeframes[replyTimeframes.length - 1]).label
}

/**
 * `replyTimeframeLabel()` reads as a standalone phrase ("Within a day"), but
 * every place that shows it does so mid-sentence ("usually replies within a
 * day") — one shared fix rather than three copies of the same one-liner.
 */
export function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1)
}
