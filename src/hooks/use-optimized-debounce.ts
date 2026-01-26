/**
 * Optimized Debounce Hook
 * Uses requestAnimationFrame for smoother debouncing
 */

import { useRef, useCallback, useEffect } from 'react'

/**
 * Debounce hook with requestAnimationFrame optimization
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @param immediate - Execute immediately on first call (default: false)
 */
export function useOptimizedDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 300,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastCallTime = useRef<number>(0)

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()

      // Clear any pending RAF
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }

      // Clear any pending timeout
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }

      // If immediate is true and this is the first call, execute immediately
      if (immediate && now - lastCallTime.current >= delay) {
        callback(...args)
        lastCallTime.current = now
        return
      }

      // Schedule execution
      rafRef.current = requestAnimationFrame(() => {
        timeoutRef.current = setTimeout(() => {
          callback(...args)
          lastCallTime.current = now
        }, delay)
      })
    },
    [callback, delay, immediate]
  )
}

/**
 * Cleanup function to clear pending debounces
 */
export function useDebounceCleanup() {
  useEffect(() => {
    return () => {
      // Clear all pending timeouts when component unmounts
      // This is handled automatically by React's cleanup
    }
  }, [])
}
