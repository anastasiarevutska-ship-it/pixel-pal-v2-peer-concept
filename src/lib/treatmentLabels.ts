import type { SupportNeed, TreatmentCode } from './types'

/**
 * Plain-language label with the acronym secondary (spec M3: "Frozen embryo
 * transfer (FET)"). Every code has one — the last four (donor egg/sperm,
 * gestational carrier, egg freezing) didn't originally, since none has a
 * single dominant clinical abbreviation the way IVF/FET/ICSI do. But the
 * compact tag chips (Pal cards, "her treatment" in a request/profile) only
 * ever show `acronym`, so leaving four codes without one meant those four
 * always rendered as a full label next to three-letter chips — visibly
 * inconsistent, not a deliberate "these stay spelled out" choice.
 *
 * `acronym` here is shorthand for that compact-chip context, not a claim
 * that DE/DS/GC/EF are standard clinical abbreviations the way FET is.
 *
 * `definition` is one plain sentence, written for someone who has been
 * through the thing but may never have learned its formal name. The Pal
 * application shows it inline next to every option — the audit's §2.2B
 * finding is that twelve bare acronyms turn "would you like to help
 * someone?" into an unaided medical self-classification test. Only the
 * compact tag chips show the acronym alone; anywhere the acronym could be
 * unfamiliar on its own, pair it with `definition` rather than removing it.
 */
export const treatmentLabels: Record<
  TreatmentCode,
  { label: string; acronym?: string; definition: string }
> = {
  IVF: {
    label: 'In vitro fertilization',
    acronym: 'IVF',
    definition: 'Eggs retrieved and fertilized in a lab, then transferred.',
  },
  IUI: {
    label: 'Intrauterine insemination',
    acronym: 'IUI',
    definition: 'Sperm placed directly in the uterus around ovulation.',
  },
  FET: {
    label: 'Frozen embryo transfer',
    acronym: 'FET',
    definition: 'An embryo frozen from an earlier cycle, thawed and transferred.',
  },
  ICSI: {
    label: 'Intracytoplasmic sperm injection',
    acronym: 'ICSI',
    definition: 'IVF where a single sperm is injected into each egg.',
  },
  OI: {
    label: 'Ovulation induction',
    acronym: 'OI',
    definition: 'Medication to bring on ovulation, often before IUI.',
  },
  PGT: {
    label: 'Genetic testing of embryos',
    acronym: 'PGT',
    definition: 'Embryos tested before transfer to check chromosomes.',
  },
  DONOR_EGG: {
    label: 'Donor eggs',
    acronym: 'DE',
    definition: 'Eggs from a donor rather than your own.',
  },
  DONOR_SPERM: {
    label: 'Donor sperm',
    acronym: 'DS',
    definition: 'Sperm from a donor rather than a partner.',
  },
  GESTATIONAL_CARRIER: {
    label: 'Gestational carrier',
    acronym: 'GC',
    definition: 'Someone else carries the pregnancy for you.',
  },
  EGG_FREEZING: {
    label: 'Egg freezing',
    acronym: 'EF',
    definition: 'Eggs retrieved and frozen to use later.',
  },
}

export const supportNeedLabels: Record<SupportNeed, string> = {
  same_treatment: "Someone who's been through the same treatment",
  emotional_side: 'Someone who understands the emotional side',
  further_along: "Someone further along than me",
  practical_tips: 'Someone with practical, day-to-day tips',
  just_listen: "Someone who'll just listen, no advice",
  other: 'Something else',
}

/** Short "FET" / "FET and IVF" / "FET, IVF, and ICSI" phrase — for
 * surfacing her treatment passively (e.g. on M4) instead of asking. */
export function formatTreatments(codes: TreatmentCode[]): string {
  const acronyms = codes.map((c) => treatmentLabels[c]?.acronym ?? treatmentLabels[c]?.label ?? c)
  if (acronyms.length === 0) return ''
  if (acronyms.length === 1) return acronyms[0]
  if (acronyms.length === 2) return `${acronyms[0]} and ${acronyms[1]}`
  return `${acronyms.slice(0, -1).join(', ')}, and ${acronyms[acronyms.length - 1]}`
}
