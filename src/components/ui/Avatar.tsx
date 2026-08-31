type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

type AvatarProps = {
  name: string
  src?: string
  size?: AvatarSize
}

const sizes: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-label-bold',
  md: 'h-11 w-11 text-body-sm-bold', // 44px — meets the min touch target
  lg: 'h-16 w-16 text-body-bold',
  // For profile-style contexts where the photo should carry real weight —
  // the suggestion cards (M4), where a bigger photo is the point: a real
  // person to feel a connection to, not a small icon next to her name.
  xl: 'h-24 w-24 text-h3',
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${sizes[size]} rounded-pill object-cover`}
      />
    )
  }
  // Local initials on Lavender 40 — spec §6 (no stock photos of real people).
  return (
    <div
      className={`${sizes[size]} flex items-center justify-center rounded-pill bg-lavender-40 text-navy`}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  )
}
