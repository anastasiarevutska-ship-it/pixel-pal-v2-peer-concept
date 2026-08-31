import { replyTimeframes } from '../../lib/replyTimeframes'

/**
 * Self-set reply-time expectation. Shared by the application step and Pal
 * home, same reasoning as `CapacityPicker` — this is a setting she lives
 * with and can revisit, not a one-time onboarding answer (the application
 * screen already promised "you can change it any time").
 */
export function ReplyTimePicker({
  value,
  onChange,
}: {
  value: number
  onChange: (hours: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {replyTimeframes.map((option) => {
        const selected = value === option.hours
        return (
          <button
            key={option.hours}
            type="button"
            onClick={() => onChange(option.hours)}
            aria-pressed={selected}
            className={`flex min-h-11 items-center rounded-field border px-4 text-body-sm-bold transition-colors ${
              selected ? 'border-navy bg-navy text-white' : 'border-navy-20 bg-white text-navy hover:border-navy-40'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
