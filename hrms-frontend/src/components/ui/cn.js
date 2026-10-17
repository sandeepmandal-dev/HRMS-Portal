import { clsx } from 'clsx'

/** Thin wrapper around clsx for conditional className composition. */
export function cn(...inputs) {
  return clsx(inputs)
}
