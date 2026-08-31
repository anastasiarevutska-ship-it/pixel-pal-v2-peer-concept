type ChipProps = {
  label: string
  /** e.g. the acronym: "Frozen embryo transfer" + secondary "(FET)" (spec M3). */
  secondary?: string
  selected: boolean
  onClick: () => void
}

/** Selectable chip — single or multi-select is the caller's concern (spec §4). */
export function Chip({ label, secondary, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-field border px-4 text-body-sm-bold transition-colors ${
        selected ? 'border-navy bg-navy text-white' : 'border-navy-20 bg-white text-navy hover:border-navy-40'
      }`}
    >
      <span>{label}</span>
      {secondary && (
        <span className={`text-label ${selected ? 'text-lavender-40' : 'text-navy-60'}`}>{secondary}</span>
      )}
    </button>
  )
}
