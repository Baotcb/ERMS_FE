/**
 * Auth Navigation Bar Component
 * Separated UI component for better maintainability
 */

import Link from 'next/link'
import { Lock } from 'lucide-react'

export function AuthNavbar() {
  return (
    <nav className="hidden md:flex items-center gap-8">
      <Link
        href="/"
        className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors"
      >
        Home
      </Link>
      <Link
        href="/jobs"
        className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors"
      >
        Jobs
      </Link>
      <Link
        href="/training"
        className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors"
      >
        Training
      </Link>
    </nav>
  )
}
