'use client'

import { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { TablePagination } from '@/components/common/table-pagination'
import { useHROffers } from '../../hooks/use-offers'
import { OfferTable } from './offer-table'
import { CreateOfferDialog } from './create-offer-dialog'
import type { OfferStatus } from '../../types/offer-types'

interface StatusTab {
    key: string
    label: string
    statusFilter: OfferStatus | 'all'
}

const STATUS_TABS: StatusTab[] = [
    { key: 'all', label: 'Tất cả', statusFilter: 'all' },
    { key: 'pending', label: 'Đang chờ', statusFilter: 'PendingApproval' },
    { key: 'sent', label: 'Đã gửi', statusFilter: 'Sent' },
    { key: 'accepted', label: 'Đã chấp nhận', statusFilter: 'Accepted' },
    { key: 'rejected', label: 'Đã từ chối', statusFilter: 'Rejected' },
    { key: 'expired', label: 'Hết hạn', statusFilter: 'Expired' },
    { key: 'cancelled', label: 'Đã hủy', statusFilter: 'Cancelled' },
]

const PAGE_SIZE = 10

export function OfferList() {
    const { data: offers, isLoading } = useHROffers()
    const [activeTab, setActiveTab] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    // Filter danh sách theo tab + search
    const filteredOffers = useMemo(() => {
        if (!offers) return []

        const currentTab = STATUS_TABS.find((t) => t.key === activeTab)
        let result = offers

        if (currentTab && currentTab.statusFilter !== 'all') {
            result = result.filter((o) => o.status === currentTab.statusFilter)
        }

        if (searchTerm.trim()) {
            const keyword = searchTerm.toLowerCase()
            result = result.filter(
                (o) =>
                    o.position.toLowerCase().includes(keyword) ||
                    (o.offerCode?.toLowerCase().includes(keyword) ?? false) ||
                    o.departmentName.toLowerCase().includes(keyword)
            )
        }

        return result
    }, [offers, activeTab, searchTerm])

    // Reset về trang 1 khi filter thay đổi
    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        setCurrentPage(1)
    }

    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
        setCurrentPage(1)
    }

    // Pagination
    const totalPages = Math.ceil(filteredOffers.length / PAGE_SIZE)
    const paginatedOffers = filteredOffers.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    )

    return (
        <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-[#0C4A6E]">
                    Quản lý Offer
                </h1>
                <p className="text-[#0C4A6E]/70 text-base">
                    Theo dõi, phê duyệt và gửi thư mời làm việc cho các ứng viên tiềm năng.
                </p>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    {/* Search Input */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <Input
                            placeholder="Tìm ứng viên, vị trí hoặc mã offer..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-sky-200 focus-visible:border-sky-300"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-1 p-1 bg-slate-50 rounded-xl">
                        {STATUS_TABS.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleTabChange(tab.key)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === tab.key
                                    ? 'bg-white shadow-sm text-[#0C4A6E]'
                                    : 'text-slate-500 hover:text-[#0369A1]'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CTA Button */}
                <Button
                    onClick={() => setDialogOpen(true)}
                    className="bg-[#22C55E] hover:bg-green-600 text-white rounded-xl h-10 px-6 font-semibold text-sm shadow-md shadow-green-200 active:scale-95 transition-all w-full md:w-auto cursor-pointer"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo Offer Mới
                </Button>
            </div>

            {/* Data Table Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 flex flex-col min-h-[420px]">
                <div className="flex-1 overflow-x-auto">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : (
                        <OfferTable data={paginatedOffers} />
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && filteredOffers.length > 0 && (
                    <div className="mt-auto px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Hiển thị {Math.min(currentPage * PAGE_SIZE, filteredOffers.length)} / {filteredOffers.length} offer
                        </p>
                        <TablePagination
                            page={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {/* Create Offer Dialog */}
            <CreateOfferDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    )
}
