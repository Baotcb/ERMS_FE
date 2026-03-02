'use client'

import { useState, useMemo } from 'react'
import { FolderOpen, Search, ArrowRight } from 'lucide-react'
import { AppliedJobCard } from './applied-job-card'
import type { Application } from '@/features/candidate/types/application-types'
import Link from 'next/link'
import '@/features/jobs/styles/Jobs.css'

// ⚠️ Mock data — backend chưa có API GET /api/applications/my-applications
const MOCK_APPLICATIONS: Application[] = [
    {
        id: 'mock-1',
        jobPostingId: 'jp-1',
        candidateId: 'c-1',
        jobTitle: 'Frontend Developer (React/Next.js)',
        jobCode: 'FE-001',
        enterpriseName: 'CÔNG TY TNHH CÔNG NGHỆ ABC',
        enterpriseLogoUrl: '',
        departmentName: 'Phòng Công nghệ',
        stage: 'Screening',
        status: 'Active',
        appliedAt: '2026-03-01T10:30:00Z',
        createdAt: '2026-03-01T10:30:00Z',
    },
    {
        id: 'mock-2',
        jobPostingId: 'jp-2',
        candidateId: 'c-1',
        jobTitle: 'Chuyên viên Nhân sự (HR Executive)',
        enterpriseName: 'CÔNG TY CỔ PHẦN XYZ VIỆT NAM',
        enterpriseLogoUrl: '',
        departmentName: 'Phòng Nhân sự',
        stage: 'Applied',
        status: 'Active',
        appliedAt: '2026-02-28T14:15:00Z',
        createdAt: '2026-02-28T14:15:00Z',
    },
    {
        id: 'mock-3',
        jobPostingId: 'jp-3',
        candidateId: 'c-1',
        jobTitle: 'Business Analyst - Fintech',
        enterpriseName: 'NGÂN HÀNG TMCP QUỐC TẾ',
        enterpriseLogoUrl: '',
        departmentName: 'Phòng Phân tích',
        stage: 'Shortlisted',
        status: 'Active',
        appliedAt: '2026-02-25T09:00:00Z',
        createdAt: '2026-02-25T09:00:00Z',
    },
    {
        id: 'mock-4',
        jobPostingId: 'jp-4',
        candidateId: 'c-1',
        jobTitle: 'Product Manager',
        enterpriseName: 'CÔNG TY TNHH PHẦN MỀM DEF',
        enterpriseLogoUrl: '',
        departmentName: 'Phòng Sản phẩm',
        stage: 'Rejected',
        status: 'Closed',
        appliedAt: '2026-02-20T16:45:00Z',
        createdAt: '2026-02-20T16:45:00Z',
    },
]

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'Applied', label: 'Đã nộp' },
    { value: 'Screening', label: 'NTD đã xem' },
    { value: 'Shortlisted', label: 'Phù hợp' },
    { value: 'Rejected', label: 'Không phù hợp' },
    { value: 'Interview', label: 'Đã liên hệ' },
]

export function ApplicationList() {
    const [statusFilter, setStatusFilter] = useState<string>('all')

    // TODO: Thay mock data bằng API call khi backend sẵn sàng
    const applications = MOCK_APPLICATIONS

    const filteredApplications = useMemo(() => {
        if (statusFilter === 'all') return applications
        return applications.filter((app) => app.stage === statusFilter)
    }, [applications, statusFilter])

    if (applications.length === 0) {
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
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Lọc theo trạng thái"
                >
                    {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* List */}
            {filteredApplications.length === 0 ? (
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
                    {filteredApplications.map((app) => (
                        <AppliedJobCard key={app.id} application={app} />
                    ))}
                </div>
            )}
        </div>
    )
}
