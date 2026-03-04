'use client'

import { useState, useMemo } from 'react'
import { Search, FolderOpen, Loader2, ArrowLeft, ArrowRight } from 'lucide-react'
import { useMyOffers } from '../hooks/use-offers'
import { CandidateOfferCard } from './candidate-offer-card'
import '@/features/jobs/styles/Jobs.css'

const PAGE_SIZE = 10

export function CandidateOfferList() {
    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')

    const { data, isLoading, error } = useMyOffers({
        pageNumber: page,
        pageSize: PAGE_SIZE,
    })

    // Client-side search filter
    const filteredOffers = useMemo(() => {
        const offers = data?.items ?? []
        if (!searchTerm.trim()) return offers
        const keyword = searchTerm.toLowerCase()
        return offers.filter(
            (o) =>
                o.position.toLowerCase().includes(keyword) ||
                o.jobTitle.toLowerCase().includes(keyword) ||
                (o.offerCode?.toLowerCase().includes(keyword) ?? false) ||
                o.departmentName.toLowerCase().includes(keyword)
        )
    }, [data?.items, searchTerm])

    const offers = data?.items ?? []
    const totalPages = data ? Math.ceil(data.totalCount / data.pageSize) : 0

    // Loading state
    if (isLoading) {
        return (
            <div className="topcv-empty">
                <Loader2
                    className="w-10 h-10 animate-spin"
                    style={{ color: '#0F4C75' }}
                />
                <h3 className="topcv-empty__title">Đang tải dữ liệu...</h3>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="topcv-empty">
                <div className="topcv-empty__icon">
                    <FolderOpen
                        className="w-14 h-14"
                        style={{ color: '#ef4444' }}
                    />
                </div>
                <h3 className="topcv-empty__title">Không thể tải dữ liệu</h3>
                <p className="topcv-empty__text">
                    {error.message || 'Đã xảy ra lỗi khi tải danh sách đề nghị.'}
                </p>
            </div>
        )
    }

    // Empty state
    if (offers.length === 0) {
        return (
            <div className="topcv-empty">
                <div className="topcv-empty__icon">
                    <FolderOpen
                        className="w-14 h-14"
                        style={{ color: '#0F4C75' }}
                    />
                </div>
                <h3 className="topcv-empty__title">
                    Chưa có đề nghị công việc nào
                </h3>
                <p className="topcv-empty__text">
                    Khi nhà tuyển dụng gửi đề nghị công việc cho bạn, chúng sẽ hiển thị
                    tại đây.
                </p>
            </div>
        )
    }

    return (
        <div>
            {/* Search bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C75]/20 focus:border-[#0F4C75] transition-colors"
                />
            </div>

            {/* Cards */}
            {filteredOffers.length === 0 ? (
                <div className="topcv-empty">
                    <h3 className="topcv-empty__title">Không có kết quả</h3>
                    <p className="topcv-empty__text">
                        Không tìm thấy đề nghị nào phù hợp với từ khoá tìm kiếm.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredOffers.map((offer) => (
                        <CandidateOfferCard key={offer.offerId} offer={offer} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !searchTerm && (
                <div className="flex items-center justify-between mt-8">
                    <p className="text-sm text-slate-500">
                        Hiển thị {(page - 1) * PAGE_SIZE + 1} -{' '}
                        {Math.min(page * PAGE_SIZE, data?.totalCount ?? 0)} trên{' '}
                        {data?.totalCount ?? 0} đề nghị
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                            (p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${p === page
                                        ? 'bg-[#0F4C75] text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {p}
                                </button>
                            )
                        )}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
