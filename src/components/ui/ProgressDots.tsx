type ProgressDotsProps = {
  total: number
  /** 0-indexed current step. */
  current: number
}

/** Onboarding step indicator (spec §4). */
export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div
      className="flex items-center justify-center gap-2"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-2 rounded-pill transition-all ${i === current ? 'w-6 bg-navy' : 'w-2 bg-navy-20'}`}
        />
      ))}
    </div>
  )
}
