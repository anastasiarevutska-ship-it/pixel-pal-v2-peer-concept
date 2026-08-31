const options = [1, 2, 3, 4, 5]

/**
 * Self-set capacity, 1–5 (D4). Shared by the application step and Pal home
 * so the value is adjusted the same way whenever she changes her mind —
 * capacity is a setting she lives with, not a one-time onboarding answer.
 *
 * Above 3 gets a soft warning, never a block: over-committing is her call,
 * but she should hear the caution once. Framed as protection, not judgment.
 */
export function CapacityPicker({
  value,
  onChange,
  min = 1,
}: {
  value: number
  onChange: (n: number) => void
  /** Raised on Pal home so she can't set capacity below people she's
   * already supporting — that would silently orphan an active member. */
  min?: number
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {options.map((n) => {
          const disabled = n < min
          const selected = n === value
          return (
            <button
              key={n}
              type="button"
              disabled={disabled}
              onClick={() => onChange(n)}
              aria-pressed={selected}
              className={`flex h-11 flex-1 items-center justify-center rounded-field border text-body-bold transition-colors ${
                selected
                  ? 'border-navy bg-navy text-white'
                  : 'border-navy-20 bg-white text-navy hover:border-navy-40'
              } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
            >
              {n}
            </button>
          )
        })}
      </div>

      <p className="text-body-sm text-navy-60">
        {value === 1
          ? 'One person at a time. A gentle place to start.'
          : `Up to ${value} people at a time.`}
      </p>

      {value > 3 && (
        <p className="rounded-field bg-yellow-40 px-3 py-2 text-body-sm text-navy-80">
          More than three at once is a lot to hold, especially on a hard week. You can lower this any
          time, and turning off new requests is always one tap.
        </p>
      )}

      {min > 1 && (
        <p className="text-label text-navy-60">
          You&rsquo;re supporting {min} {min === 1 ? 'person' : 'people'} right now, so this
          can&rsquo;t go lower until a conversation wraps up.
        </p>
      )}
    </div>
  )
}
