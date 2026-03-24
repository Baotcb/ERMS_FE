
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const vndFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

/**
 * Format a number to VND currency string.
 * @example formatVND(1500000) → "1.500.000 ₫"
 */
export function formatVND(value: number): string {
  return vndFormatter.format(value);
}
