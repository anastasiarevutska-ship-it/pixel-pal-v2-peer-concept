import type { ReactNode, TextareaHTMLAttributes } from 'react'

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  helperText?: string
  /** Rotating prompt slot, e.g. "Tell her where you are right now" (spec M5). */
  promptHelper?: ReactNode
}

export function TextArea({
  label,
  helperText,
  promptHelper,
  id,
  rows = 4,
  className = '',
  ...props
}: TextAreaProps) {
  const areaId = id ?? props.name
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={areaId} className="text-label-bold text-navy-60">
          {label}
        </label>
      )}
      {promptHelper && <div className="text-body-sm text-navy-60">{promptHelper}</div>}
      <textarea
        id={areaId}
        rows={rows}
        className={`rounded-field border border-navy-20 bg-white px-4 py-3 text-body text-navy placeholder:text-navy-40 focus:border-lavender focus:outline-none ${className}`}
        {...props}
      />
      {helperText && <p className="text-label text-navy-60">{helperText}</p>}
    </div>
  )
}
