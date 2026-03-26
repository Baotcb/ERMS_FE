/**
 * Job Card Wrapper – bọc job card với logic hover preview
 * Dùng chung cho tất cả các nơi hiển thị danh sách công việc
 */

'use client'

import { useRef, useCallback } from 'react'

interface JobPreviewWrapperProps {
    jobId: string
    onHover: (jobId: string, element: HTMLElement) => void
    onLeave: () => void
    children: React.ReactNode
    className?: string
}

export function JobPreviewWrapper({
    jobId,
    onHover,
    onLeave,
    children,
    className,
}: JobPreviewWrapperProps) {
    const wrapperRef = useRef<HTMLDivElement>(null)

    const handleMouseEnter = useCallback(() => {
        if (wrapperRef.current) {
            onHover(jobId, wrapperRef.current)
        }
    }, [jobId, onHover])

    return (
        <div
            ref={wrapperRef}
            className={className}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={onLeave}
        >
            {children}
        </div>
    )
}
