'use client'

import React, { useState } from 'react'
import { Facebook, Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface FacebookShareButtonProps {
    /** URL to share */
    url: string
    /** Title of the content being shared */
    title: string
    /** Optional custom share text */
    shareText?: string
    /** Button variant */
    variant?: 'default' | 'outline' | 'ghost' | 'icon'
    /** Button size */
    size?: 'default' | 'sm' | 'lg' | 'icon'
    /** Additional CSS classes */
    className?: string
    /** Whether to show the text label */
    showLabel?: boolean
}

/**
 * FacebookShareButton - A reusable button component for sharing content to Facebook
 * 
 * Features:
 * - Copies link to clipboard automatically
 * - Opens Facebook share dialog in a new tab
 * - Shows tooltip with instructions
 * - Visual feedback when link is copied
 * 
 * @example
 * <FacebookShareButton
 *   url="https://example.com/job/123"
 *   title="Software Engineer Position"
 *   shareText="Đang tuyển dụng vị trí Software Engineer!"
 * />
 */
export function FacebookShareButton({
    url,
    title,
    shareText,
    variant = 'outline',
    size = 'sm',
    className,
    showLabel = true,
}: FacebookShareButtonProps) {
    const { toast } = useToast()
    const [copied, setCopied] = useState(false)
    const [isSharing, setIsSharing] = useState(false)

    const handleShareToFacebook = async () => {
        if (isSharing) return
        setIsSharing(true)

        const defaultShareText = shareText || `${title} - Xem chi tiết và ứng tuyển ngay!`
        const quote = `${defaultShareText}\n${url}`

        // Copy link to clipboard first
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 3000)
        } catch (err) {
            console.warn('Failed to copy to clipboard:', err)
        }

        // Open Facebook share dialog in a new tab (better UX than popup)
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(quote)}`
        
        const newTab = window.open(fbUrl, '_blank', 'noopener,noreferrer')

        if (!newTab) {
            // Fallback to popup if new tab is blocked
            const popup = window.open(
                fbUrl,
                'facebook-share',
                'width=760,height=680,toolbar=0,menubar=0,location=0,status=0,resizable=1,scrollbars=1'
            )

            if (!popup) {
                toast({
                    title: 'Không thể mở Facebook',
                    description: 'Vui lòng tắt trình chặn popup và thử lại.',
                    variant: 'destructive',
                })
                setIsSharing(false)
                return
            }
        }

        toast({
            title: '🔗 Link đã được sao chép!',
            description: 'Dán link vào bài viết Facebook bằng Ctrl+V (hoặc Cmd+V trên Mac).',
        })

        setIsSharing(false)
    }

    if (variant === 'icon') {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleShareToFacebook}
                            disabled={isSharing}
                            className={cn(
                                'text-[#1877F2] hover:bg-[#1877F2]/10 hover:text-[#1877F2] transition-all duration-200',
                                isSharing && 'animate-pulse',
                                className
                            )}
                        >
                            {copied ? (
                                <Check className="w-5 h-5 text-green-500" />
                            ) : (
                                <Facebook className="w-5 h-5" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Chia sẻ lên Facebook</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={variant}
                        size={size}
                        onClick={handleShareToFacebook}
                        disabled={isSharing}
                        className={cn(
                            'group transition-all duration-200',
                            variant === 'default' && 'bg-[#1877F2] hover:bg-[#166FE5] text-white',
                            variant === 'outline' && 'border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2]/10',
                            isSharing && 'animate-pulse',
                            className
                        )}
                    >
                        {copied ? (
                            <Check className="w-4 h-4 mr-2 text-green-500" />
                        ) : (
                            <Facebook className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        )}
                        {showLabel && (copied ? 'Đã copy link!' : 'Facebook')}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">Chia sẻ lên Facebook</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Link sẽ được copy tự động. Sau đó dán vào bài viết Facebook.
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
