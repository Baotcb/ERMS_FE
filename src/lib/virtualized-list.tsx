/**
 * Virtualized List Helper
 * For efficiently rendering long lists with react-window
 */

/**
 * Check if virtualization should be used
 * Only use virtualization for lists with more than 50 items
 */
export function shouldVirtualize(count: number): boolean {
  return count > 50
}

/**
 * Get estimated row height for virtual list
 * Adjust based on your card component height
 */
export function getRowHeight(): number {
  // JobCard height approximately: padding(40) + content(200) + footer(60) = 300px
  return 300
}

/**
 * Calculate visible items in viewport
 */
export function getVisibleItemsCount(
  containerHeight: number,
  itemHeight: number
): number {
  return Math.ceil(containerHeight / itemHeight) + 2 // Buffer of 2 items
}
