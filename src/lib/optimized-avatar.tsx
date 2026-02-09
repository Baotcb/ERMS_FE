/**
 * Optimized Avatar Image Component
 * Uses Next.js Image component for external images with optimization
 */

import Image from 'next/image'
import { cn } from '@/lib/utils'

type OptimizedAvatarImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
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
  width,
  height,
  ...props
}: OptimizedAvatarImageProps) {
  // Use Next.js Image for external URLs with optimization
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return (
      <div className="relative h-full w-full">
        <Image
          {...props}
          src={src as string}
          alt={alt}
          fill
          className={cn('object-cover', className)}
          sizes={`${size}px`}
          priority={false}
        />
      </div>
    )
  }

  // Use regular img for local files or data URLs
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  )
}
