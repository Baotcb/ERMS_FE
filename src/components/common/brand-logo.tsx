/**
 * Brand Logo Component
 * Reusable ERMS logo component
 */

import Image from 'next/image'
import Link from 'next/link'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
}

export function BrandLogo({ size = 'md' }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  return (
    <Link href="/" className="flex items-center gap-3 text-gray-900 dark:text-white">
      <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
        <Image
          src="/logo.png"
          alt="ERMS Logo"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight">ERMS</span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Recruiting & Training
        </span>
      </div>
    </Link>
  )
}
