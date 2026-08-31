/**
 * Report's reason selector — the one thing it asks for beyond "who". Kept
 * to a short, generic list on purpose: the point of Report is that neither
 * side has to explain themselves to the other, so the form shouldn't
 * demand a fuller account than that from the person filing it either.
 * Shared between the member's Chat.tsx and the Pal's PalChat.tsx so the two
 * ends of the same action never quietly drift apart.
 */
export const reportReasons = [
  'Inappropriate or disrespectful behavior',
  'Medical advice or crossing boundaries',
  'Harassment or threatening behavior',
  'Something else',
] as const

export type ReportReason = (typeof reportReasons)[number]
