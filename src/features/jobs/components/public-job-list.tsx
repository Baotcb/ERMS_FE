'use client'

import { Suspense, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Briefcase, Search } from 'lucide-react'

import { JobSearchBar } from './job-search-bar'
import { JobFilterSidebar } from './job-filter-sidebar'
import { ListingJobCard } from './listing-job-card'
import { JobPagination } from './job-pagination'
import { usePublicJobs } from '../hooks/use-public-jobs'
import '@/features/jobs/styles/Jobs.css'

/* Skeleton khi đang loading */
function ListingSkeleton() {
    return (
        <div className="job-listing__container">
            <aside className="job-filter-sidebar" style={{ minHeight: 300 }}>
                <div style={{ height: 20, background: '#f2f4f5', borderRadius: 4, marginBottom: 16 }} />
                <div style={{ height: 16, background: '#f2f4f5', borderRadius: 4, marginBottom: 8, width: '80%' }} />
                <div style={{ height: 16, background: '#f2f4f5', borderRadius: 4, marginBottom: 8, width: '60%' }} />
            </aside>
            <div className="job-listing__main">
                <div className="topcv-page__list">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="listing-job-card" style={{ opacity: 0.5 }}>
                            <div className="listing-job-card__logo" style={{ background: '#f2f4f5' }} />
                            <div className="listing-job-card__info">
                                <div style={{ height: 20, background: '#f2f4f5', borderRadius: 4, marginBottom: 8, width: '70%' }} />
                                <div style={{ height: 14, background: '#f2f4f5', borderRadius: 4, width: '50%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* Nội dung chính */
function PublicJobListContent() {
    const searchParams = useSearchParams()
    const [page, setPage] = useState(1)
    const [experience, setExperience] = useState('')
    const [salary, setSalary] = useState('')
    const [employment, setEmployment] = useState('')

    const search = searchParams.get('q') || undefined
    const location = searchParams.get('location') || undefined

    const { data, isLoading, error } = usePublicJobs({ page, pageSize: 10, search, location })

    const clearFilters = useCallback(() => {
        setExperience('')
        setSalary('')
        setEmployment('')
    }, [])

    const items = data?.items ?? []
    const filteredJobs = employment
        ? items.filter((j) => j.employmentType === employment)
        : items

    if (isLoading) return <ListingSkeleton />

    if (error) {
        return (
            <div className="job-listing__container" style={{ display: 'block' }}>
                <div className="topcv-empty">
                    <div className="topcv-empty__icon">
                        <Briefcase className="w-14 h-14" style={{ color: '#e74c3c' }} />
                    </div>
                    <h3 className="topcv-empty__title">Không thể tải danh sách việc làm</h3>
                    <p className="topcv-empty__text">Vui lòng thử lại sau</p>
                    <button className="topcv-empty__button" onClick={() => window.location.reload()} type="button">Thử lại</button>
                </div>
            </div>
        )
    }

    if (!data?.items || data.items.length === 0) {
        return (
            <div className="job-listing__container" style={{ display: 'block' }}>
                <div className="topcv-empty">
                    <div className="topcv-empty__icon">
                        <Search className="w-14 h-14" style={{ color: '#00b14f' }} />
                    </div>
                    <h3 className="topcv-empty__title">Không tìm thấy việc làm nào</h3>
                    <p className="topcv-empty__text">Vui lòng thử tìm kiếm với từ khoá khác</p>
                </div>
            </div>
        )
    }

    return (
        <div className="job-listing__container">
            <JobFilterSidebar
                experience={experience}
                salary={salary}
                employment={employment}
                onExperienceChange={setExperience}
                onSalaryChange={setSalary}
                onEmploymentChange={setEmployment}
                onClear={clearFilters}
            />

            <div className="job-listing__main">
                {/* Header */}
                <div className="job-listing__header">
                    <h2 className="job-listing__count">
                        Tuyển dụng{' '}
                        <span className="job-listing__count-number">{data.totalCount.toLocaleString('vi-VN')}</span>{' '}
                        việc làm
                    </h2>
                    <div className="job-listing__sort">
                        <span className="job-listing__sort-label">Sắp xếp theo:</span>
                        <select className="job-listing__sort-select" defaultValue="newest">
                            <option value="newest">Mới nhất</option>
                            <option value="salary">Lương cao nhất</option>
                            <option value="relevant">Phù hợp nhất</option>
                        </select>
                    </div>
                </div>

                {/* Job List */}
                <div className="topcv-page__list">
                    {filteredJobs.map((job) => (
                        <ListingJobCard key={job.id} job={job} />
                    ))}
                </div>

                <JobPagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
            </div>
        </div>
    )
}

/* Public export */
export function PublicJobList() {
    return (
        <>
            <Suspense>
                <JobSearchBar />
            </Suspense>
            <Suspense fallback={<ListingSkeleton />}>
                <PublicJobListContent />
            </Suspense>
        </>
    )
}
