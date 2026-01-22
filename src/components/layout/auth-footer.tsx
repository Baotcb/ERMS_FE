/**
 * Auth Footer Component
 * Separated UI component for better maintainability
 */

import Link from 'next/link'

export function AuthFooter() {
  return (
    <div className="flex space-x-6 text-sm text-gray-500 dark:text-gray-400">
      <Link
        href="/not-found"
        className="hover:text-primary dark:hover:text-white transition-colors"
      >
        Chính sách bảo mật
      </Link>
      <Link
        href="/not-found"
        className="hover:text-primary dark:hover:text-white transition-colors"
      >
        Điều khoản dịch vụ
      </Link>
      <Link
        href="/not-found"
        className="hover:text-primary dark:hover:text-white transition-colors"
      >
        Hỗ trợ
      </Link>
    </div>
  )
}
