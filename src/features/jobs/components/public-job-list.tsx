'use client'

import { Suspense, useState, useCallback, useMemo } from 'react'
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
const FE_PAGE_SIZE = 10
const API_FETCH_SIZE = 100

function PublicJobListContent() {
    const searchParams = useSearchParams()
    const [page, setPage] = useState(1)
    const [experience, setExperience] = useState('')
    const [salary, setSalary] = useState('')
    const [employment, setEmployment] = useState('')

    const search = searchParams.get('q') || undefined
    const location = searchParams.get('location') || undefined

    // Fetch nhiều data, filter + phân trang hoàn toàn ở FE
    const { data, isLoading, error } = usePublicJobs({ page: 1, pageSize: API_FETCH_SIZE, search, location })

    const handleFilterChange = useCallback((setter: (v: string) => void) => (v: string) => {
        setter(v)
        setPage(1)
    }, [])

    const clearFilters = useCallback(() => {
        setExperience('')
        setSalary('')
        setEmployment('')
        setPage(1)
    }, [])

    // Client-side filter
    const filteredJobs = useMemo(() => {
        const allItems = data?.items ?? []
        let result = allItems

        if (employment) {
            result = result.filter((j) => j.employmentType === employment)
        }

        if (experience) {
            result = result.filter((j) => {
                if (!j.experienceLevel) return experience === '0'
                // Parse số từ experienceLevel backend (ví dụ: "2-5 years", "3 years")
                const nums = j.experienceLevel.match(/\d+/g)?.map(Number) ?? []
                if (nums.length === 0) return experience === '0'

                const jobMin = nums[0]
                const jobMax = nums.length > 1 ? nums[1] : nums[0]

                if (experience === '0') return jobMin === 0 && jobMax === 0
                if (experience === '5+') return jobMax >= 5

                // Parse filter range (ví dụ: "2-3" → filterMin=2, filterMax=3)
                const [filterMin, filterMax] = experience.split('-').map(Number)
                // Kiểm tra overlap: job range [jobMin, jobMax] có giao với filter range [filterMin, filterMax]
                return jobMin <= filterMax && jobMax >= filterMin
            })
        }

        if (salary) {
            result = result.filter((j) => {
                if (!j.showSalary) return false
                const max = j.salaryRangeMax ?? 0
                const min = j.salaryRangeMin ?? 0
                const ref = max > 0 ? max : min

                switch (salary) {
                    case '0-10': return ref > 0 && ref <= 10_000_000
                    case '10-15': return ref > 10_000_000 && ref <= 15_000_000
                    case '15-20': return ref > 15_000_000 && ref <= 20_000_000
                    case '20-30': return ref > 20_000_000 && ref <= 30_000_000
                    case '30+': return ref > 30_000_000
                    default: return true
                }
            })
        }

        return result
    }, [data?.items, employment, experience, salary])

    // FE pagination
    const totalFiltered = filteredJobs.length
    const totalPages = Math.max(1, Math.ceil(totalFiltered / FE_PAGE_SIZE))
    const paginatedJobs = useMemo(() => {
        const start = (page - 1) * FE_PAGE_SIZE
        return filteredJobs.slice(start, start + FE_PAGE_SIZE)
    }, [filteredJobs, page])

    const hasFilters = employment || experience || salary

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
                onExperienceChange={handleFilterChange(setExperience)}
                onSalaryChange={handleFilterChange(setSalary)}
                onEmploymentChange={handleFilterChange(setEmployment)}
                onClear={clearFilters}
            />

            <div className="job-listing__main">
                {/* Header */}
                <div className="job-listing__header">
                    <h2 className="job-listing__count">
                        {hasFilters ? (
                            <>
                                Tìm thấy{' '}
                                <span className="job-listing__count-number">{totalFiltered.toLocaleString('vi-VN')}</span>{' '}
                                việc làm phù hợp
                            </>
                        ) : (
                            <>
                                Tuyển dụng{' '}
                                <span className="job-listing__count-number">{(data.totalCount).toLocaleString('vi-VN')}</span>{' '}
                                việc làm
                            </>
                        )}
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
                    {paginatedJobs.length > 0 ? (
                        paginatedJobs.map((job) => (
                            <ListingJobCard key={job.id} job={job} />
                        ))
                    ) : (
                        <div className="topcv-empty" style={{ padding: '40px 0' }}>
                            <div className="topcv-empty__icon">
                                <Search className="w-10 h-10" style={{ color: '#a6acb2' }} />
                            </div>
                            <h3 className="topcv-empty__title" style={{ fontSize: '1rem' }}>Không tìm thấy việc làm phù hợp với bộ lọc</h3>
                            <button className="topcv-empty__button" onClick={clearFilters} type="button">Xoá bộ lọc</button>
                        </div>
                    )}
                </div>

                {paginatedJobs.length > 0 && (
                    <JobPagination page={page} totalPages={totalPages} onPageChange={setPage} />
                )}
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
