interface ProfileAvatarProps {
  avatarDataUrl: string
  initials: string
  /** Rendered pixel size of the circle. */
  size?: number
  className?: string
}

/**
 * The user's photo as a circle, falling back to their initials. Decorative
 * everywhere it is used - the surrounding button carries the label - so it is
 * hidden from assistive tech.
 */
export function ProfileAvatar({
  avatarDataUrl,
  initials,
  size = 24,
  className,
}: ProfileAvatarProps) {
  const classes = className ? `profile-avatar ${className}` : 'profile-avatar'
  const style = { height: `${size}px`, width: `${size}px` }

  if (avatarDataUrl) {
    return (
      <img
        alt=""
        aria-hidden="true"
        className={`${classes} profile-avatar--photo`}
        src={avatarDataUrl}
        style={style}
      />
    )
  }

  return (
    <span aria-hidden="true" className={classes} style={style}>
      {initials}
    </span>
  )
}
