'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface JobPaginationProps {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function JobPagination({ page, totalPages, onPageChange }: JobPaginationProps) {
    const pages = useMemo(() => {
        if (totalPages <= 1) return []
        const result: (number | '...')[] = []
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) result.push(i)
        } else {
            result.push(1)
            if (page > 3) result.push('...')
            const start = Math.max(2, page - 1)
            const end = Math.min(totalPages - 1, page + 1)
            for (let i = start; i <= end; i++) result.push(i)
            if (page < totalPages - 2) result.push('...')
            result.push(totalPages)
        }
        return result
    }, [page, totalPages])

    if (totalPages <= 1) return null

    return (
        <nav className="job-pagination" aria-label="Phân trang">
            <button
                className="job-pagination__btn"
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
                aria-label="Trang trước"
                type="button"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {pages.map((p, i) =>
                p === '...' ? (
                    <span key={`dots-${i}`} className="job-pagination__dots">...</span>
                ) : (
                    <button
                        key={p}
                        className={cn("job-pagination__btn", page === p && "job-pagination__btn--active")}
                        onClick={() => onPageChange(p)}
                        type="button"
                    >
                        {p}
                    </button>
                )
            )}

            <button
                className="job-pagination__btn"
                disabled={page === totalPages}
                onClick={() => onPageChange(page + 1)}
                aria-label="Trang sau"
                type="button"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </nav>
    )
}
