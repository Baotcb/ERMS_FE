'use client'

import { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useHROffers } from '../../hooks/use-offers'
import { OfferCard } from './offer-card'
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
]

export function OfferList() {
    const { data: offers, isLoading } = useHROffers()
    const [activeTab, setActiveTab] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)

    // Đếm số lượng theo từng status
    const statusCounts = useMemo(() => {
        if (!offers) return {} as Record<string, number>
        const counts: Record<string, number> = { all: offers.length }
        for (const offer of offers) {
            counts[offer.status] = (counts[offer.status] || 0) + 1
        }
        return counts
    }, [offers])

    // Filter danh sách theo tab + search
    const filteredOffers = useMemo(() => {
        if (!offers) return []

        const currentTab = STATUS_TABS.find((t) => t.key === activeTab)
        let result = offers

        // Filter by status tab
        if (currentTab && currentTab.statusFilter !== 'all') {
            result = result.filter(
                (o) => o.status === currentTab.statusFilter
            )
        }

        // Filter by search keyword
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

    const getTabCount = (tab: StatusTab): number => {
        if (tab.statusFilter === 'all') return statusCounts.all || 0
        return statusCounts[tab.statusFilter] || 0
    }

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#0F4C75]">
                        Quản lý Offer
                    </h1>
                    <p className="text-slate-500 text-sm max-w-xl">
                        Theo dõi, phê duyệt và gửi thư mời làm việc cho các
                        ứng viên tiềm năng. Hệ thống tự động cập nhật trạng
                        thái khi ứng viên phản hồi.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        className="rounded-xl bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white font-bold shadow-md"
                        onClick={() => setDialogOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo Offer Mới
                    </Button>
                </div>
            </div>

            {/* Filters + Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center">
                    {/* Status tabs */}
                    <div className="flex border-b lg:border-b-0 lg:border-r border-slate-200 p-1 flex-1 overflow-x-auto">
                        {STATUS_TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`whitespace-nowrap px-5 py-3 text-sm font-medium transition-colors ${activeTab === tab.key
                                    ? 'font-bold border-b-2 border-[#0F4C75] text-[#0F4C75]'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab.label} ({getTabCount(tab)})
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="p-3 lg:w-96">
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Tìm ứng viên, vị trí hoặc mã offer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-slate-100 border-none focus:ring-2 focus:ring-[#0F4C75]/20"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* List Header (desktop) */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                <div className="col-span-4">Ứng viên & Vị trí</div>
                <div className="col-span-2 text-center">Lương offer</div>
                <div className="col-span-2 text-center">Ngày bắt đầu</div>
                <div className="col-span-2 text-center">Trạng thái</div>
                <div className="col-span-2 text-right">Thao tác</div>
            </div>

            {/* Offer Cards */}
            <div className="flex flex-col gap-3">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton
                            key={i}
                            className="h-24 rounded-xl"
                        />
                    ))
                ) : filteredOffers.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <p className="text-lg font-semibold">
                            Chưa có offer nào
                        </p>
                        <p className="text-sm mt-1">
                            Tạo offer mới cho ứng viên từ danh sách đơn ứng
                            tuyển
                        </p>
                    </div>
                ) : (
                    filteredOffers.map((offer) => (
                        <OfferCard key={offer.id} offer={offer} />
                    ))
                )}
            </div>

            {/* Pagination info */}
            {!isLoading && filteredOffers.length > 0 && (
                <div className="flex items-center justify-between border-t border-slate-200 pt-6">
                    <p className="text-sm text-slate-500">
                        Hiển thị {filteredOffers.length} trên{' '}
                        {offers?.length || 0} offer
                    </p>
                </div>
            )}

            {/* Create Offer Dialog */}
            <CreateOfferDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    )
}
