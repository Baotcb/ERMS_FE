'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TablePaginationProps {
    /** Current page number (1-indexed) */
    page: number;
    /** Total number of pages */
    totalPages: number;
    /** Callback when page changes */
    onPageChange: (page: number) => void;
    /** Optional className for the container */
    className?: string;
}

/**
 * Reusable pagination component for tables.
 * Renders "Trước / Trang X / Y / Tiếp" navigation.
 */
export function TablePagination({ page, totalPages, onPageChange, className }: TablePaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className={`mt-auto px-6 py-4 border-t border-slate-100 flex items-center justify-between ${className ?? ''}`}>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 text-slate-500 hover:text-[#0369A1] hover:bg-slate-50 cursor-pointer"
            >
                <ChevronLeft className="w-4 h-4" /> Trước
            </Button>
            <span className="text-sm font-medium text-slate-600">
                Trang {page} / {totalPages}
            </span>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 text-slate-500 hover:text-[#0369A1] hover:bg-slate-50 cursor-pointer"
            >
                Tiếp <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
}
