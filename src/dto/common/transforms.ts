import { Transform } from 'class-transformer'

/** Trim string input; leave other types untouched so the validators can reject them. */
export const Trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))

/** Trim and lower-case string input. */
export const Normalize = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))

/** Parse `"true"` / `"false"` query strings into booleans. */
export const ToBoolean = () =>
  Transform(({ value }) => {
    if (value === 'true' || value === true) return true
    if (value === 'false' || value === false) return false
    return value
  })
