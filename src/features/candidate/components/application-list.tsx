'use client'

import { useState } from 'react'
import { FolderOpen, Search, ArrowRight, Loader2 } from 'lucide-react'
import { AppliedJobCard } from './applied-job-card'
import { useMyApplications } from '@/features/candidate/hooks/use-applications'
import Link from 'next/link'
import '@/features/jobs/styles/Jobs.css'

const STAGE_OPTIONS: { value: string; label: string }[] = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'Applied', label: 'Đã nộp' },
    { value: 'Reviewing', label: 'Đang xem xét' },
    { value: 'Shortlisted', label: 'Phù hợp' },
    { value: 'InterviewScheduled', label: 'Lịch phỏng vấn' },
    { value: 'Interviewed', label: 'Đã phỏng vấn' },
    { value: 'OfferProcessing', label: 'Đang xử lý offer' },
    { value: 'Offered', label: 'Đã nhận offer' },
    { value: 'Hired', label: 'Đã tuyển' },
    { value: 'Rejected', label: 'Không phù hợp' },
    { value: 'Withdrawn', label: 'Đã rút' },
]

export function ApplicationList() {
    const [stageFilter, setStageFilter] = useState<string>('all')

    const { data, isLoading, error } = useMyApplications(
        stageFilter !== 'all' ? { stageFilter } : undefined
    )

    const applications = data?.items ?? []

    // Loading state
    if (isLoading) {
        return (
            <div className="topcv-empty">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#00b14f' }} />
                <h3 className="topcv-empty__title">Đang tải dữ liệu...</h3>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="topcv-empty">
                <div className="topcv-empty__icon">
                    <FolderOpen className="w-14 h-14" style={{ color: '#ef4444' }} />
                </div>
                <h3 className="topcv-empty__title">Không thể tải dữ liệu</h3>
                <p className="topcv-empty__text">
                    {error.message || 'Đã xảy ra lỗi khi tải danh sách ứng tuyển.'}
                </p>
            </div>
        )
    }

    // Empty state (no applications at all, no filter active)
    if (applications.length === 0 && stageFilter === 'all') {
        return (
            <div className="topcv-empty">
                <div className="topcv-empty__icon">
                    <FolderOpen className="w-14 h-14" style={{ color: '#00b14f' }} />
                </div>
                <h3 className="topcv-empty__title">Bạn chưa ứng tuyển công việc nào!</h3>
                <p className="topcv-empty__text">
                    Hãy tìm kiếm và ứng tuyển các vị trí phù hợp với bạn ngay bây giờ.
                </p>
                <Link href="/jobs">
                    <button className="topcv-empty__button" type="button">
                        <Search className="w-5 h-5" />
                        Tìm việc ngay
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </Link>
            </div>
        )
    }

    return (
        <div>
            {/* Filter Bar */}
            <div className="topcv-filter-bar">
                <select
                    className="topcv-filter-bar__select"
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    aria-label="Lọc theo trạng thái"
                >
                    {STAGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* List */}
            {applications.length === 0 ? (
                <div className="topcv-empty">
                    <div className="topcv-empty__icon">
                        <FolderOpen className="w-14 h-14" style={{ color: '#00b14f' }} />
                    </div>
                    <h3 className="topcv-empty__title">Không có kết quả nào</h3>
                    <p className="topcv-empty__text">
                        Không tìm thấy đơn ứng tuyển nào với bộ lọc hiện tại.
                    </p>
                </div>
            ) : (
                <div className="topcv-page__list">
                    {applications.map((app) => (
                        <AppliedJobCard key={app.applicationId} application={app} />
                    ))}
                </div>
            )}
        </div>
    )
}
