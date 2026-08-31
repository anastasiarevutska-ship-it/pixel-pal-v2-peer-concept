import type { InputHTMLAttributes } from 'react'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  helperText?: string
  error?: string
}

export function TextField({ label, helperText, error, id, className = '', ...props }: TextFieldProps) {
  const inputId = id ?? props.name
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-label-bold text-navy-60">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`min-h-11 rounded-field border border-navy-20 bg-white px-4 text-body text-navy placeholder:text-navy-40 focus:border-lavender focus:outline-none ${className}`}
        {...props}
      />
      {/* No red/coral for errors — spec §3 keeps coral off alarm duty, and
          the product's tone is never-alarming. Emphasis via weight, not color. */}
      {(error ?? helperText) && <p className="text-label text-navy-60">{error ?? helperText}</p>}
    </div>
  )
}
