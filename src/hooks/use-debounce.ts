/**
 * Debounce Hook
 * Delays updating a value until after a specified delay has passed
 * Useful for search inputs, auto-saves, and other delayed actions
 */

import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set up a timer to update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up the timer if value or delay changes
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Throttle Hook
 * Limits how often a function can be called
 * Useful for scroll events, mouse movements, etc.
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number = 300
): T {
  const [inThrottle, setInThrottle] = useState(false)

  return ((...args: unknown[]) => {
    if (!inThrottle) {
      func(...args)
      setInThrottle(true)
      setTimeout(() => setInThrottle(false), limit)
    }
  }) as T
}
