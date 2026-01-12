/**
 * Optimized Avatar Image Component
 * Uses Next.js Image component for external images with optimization
 */

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedAvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt?: string
  className?: string
  size?: number
}

export function OptimizedAvatarImage({
  src,
  alt = 'Avatar',
  className,
  size = 40,
  ...props
}: OptimizedAvatarImageProps) {
  // Use Next.js Image for external URLs with optimization
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return (
      <div className="relative h-full w-full">
        <Image
          src={src}
          alt={alt}
          fill
          className={cn('object-cover', className)}
          sizes={`${size}px`}
          priority={false}
          {...props as any}
        />
      </div>
    )
  }

  // Use regular img for local files or data URLs
  return (
    <img
      src={src}
      alt={alt}
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  )
}
