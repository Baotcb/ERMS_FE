'use client'

import { Suspense, useCallback, useEffect, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Briefcase, Search } from 'lucide-react'

import { JobSearchBar } from './job-search-bar'
import { JobFilterSidebar } from './job-filter-sidebar'
import { ListingJobCard } from './listing-job-card'
import { JobPagination } from './job-pagination'
import { usePublicJobFilterOptions, usePublicJobs } from '../hooks/use-public-jobs'
import { EMPLOYMENT_OPTIONS, PUBLIC_JOB_PAGE_SIZE, SORT_OPTIONS, getSalaryRangeFromValue, mergeJobSearchParams, parseJobPageParam } from '../job-filtering'
import { useJobPreview } from '../hooks/use-job-preview'
import { JobPreviewPopup } from './job-preview-popup'
import { JobPreviewWrapper } from './job-preview-wrapper'
import '@/features/jobs/styles/Jobs.css'

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
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="listing-job-card" style={{ opacity: 0.5 }}>
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

function PublicJobListContent() {
    const router = useRouter()
    const pathname = usePathname()
    const { preview, showPreview, hidePreview } = useJobPreview()
    const searchParams = useSearchParams()

    const search = searchParams.get('q') || undefined
    const location = searchParams.get('location') || undefined
    const employment = searchParams.get('employment') || ''
    const experience = searchParams.get('experience') || ''
    const salary = searchParams.get('salary') || ''
    const departmentId = searchParams.get('departmentId') || ''
    const sort = searchParams.get('sort') || 'newest'
    const page = parseJobPageParam(searchParams.get('page'))
    const salaryRange = getSalaryRangeFromValue(salary)

    const { data, isLoading, error } = usePublicJobs({
        page,
        pageSize: PUBLIC_JOB_PAGE_SIZE,
        search,
        location,
        employmentType: employment || undefined,
        experienceBucket: experience || undefined,
        minSalary: salaryRange.minSalary,
        maxSalary: salaryRange.maxSalary,
        departmentId: departmentId || undefined,
        sortBy: sort,
    })
    const { data: filterOptions } = usePublicJobFilterOptions()

    const updateFilters = useCallback((updates: Record<string, string | number | null>) => {
        const nextParams = mergeJobSearchParams(searchParams, updates)
        const query = nextParams.toString()
        router.push(query ? `${pathname}?${query}` : pathname)
    }, [pathname, router, searchParams])

    const clearFilters = useCallback(() => {
        updateFilters({
            employment: null,
            experience: null,
            salary: null,
            departmentId: null,
        })
    }, [updateFilters])

    const hasFilters = Boolean(employment || experience || salary || departmentId)
    const items = data?.items ?? []
    const shouldClampPage = Boolean(data && data.totalPages > 0 && page > data.totalPages)
    const resultCount = useMemo(
        () => (data?.totalCount ?? 0).toLocaleString('vi-VN'),
        [data?.totalCount]
    )

    useEffect(() => {
        if (!shouldClampPage || !data) {
            return
        }

        updateFilters({ page: data.totalPages })
    }, [data, shouldClampPage, updateFilters])

    if (isLoading || shouldClampPage) return <ListingSkeleton />

    if (error) {
        return (
            <div className="job-listing__container" style={{ display: 'block' }}>
                <div className="topcv-empty">
                    <div className="topcv-empty__icon">
                        <Briefcase className="w-14 h-14" style={{ color: '#e74c3c' }} />
                    </div>
                    <h3 className="topcv-empty__title">Không thể tải danh sách việc làm</h3>
                    <p className="topcv-empty__text">Vui lòng thử lại sau</p>
                    <button className="topcv-empty__button" onClick={() => window.location.reload()} type="button">
                        Thử lại
                    </button>
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
                departmentId={departmentId}
                departments={filterOptions?.departments ?? []}
                employmentTypes={filterOptions?.employmentTypes ?? [...EMPLOYMENT_OPTIONS]}
                onExperienceChange={(value) => updateFilters({ experience: value || null })}
                onSalaryChange={(value) => updateFilters({ salary: value || null })}
                onEmploymentChange={(value) => updateFilters({ employment: value || null })}
                onDepartmentChange={(value) => updateFilters({ departmentId: value || null })}
                onClear={clearFilters}
            />

            <div className="job-listing__main">
                <div className="job-listing__header">
                    <h2 className="job-listing__count">
                        {hasFilters ? (
                            <>
                                Tìm thấy <span className="job-listing__count-number">{resultCount}</span> việc làm phù hợp
                            </>
                        ) : (
                            <>
                                Tuyển dụng <span className="job-listing__count-number">{resultCount}</span> việc làm
                            </>
                        )}
                    </h2>
                    <div className="job-listing__sort">
                        <span className="job-listing__sort-label">Sắp xếp theo:</span>
                        <select
                            className="job-listing__sort-select"
                            value={sort}
                            onChange={(event) => updateFilters({ sort: event.target.value })}
                        >
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="topcv-page__list">
                    {items.length > 0 ? (
                        items.map((job) => (
                            <JobPreviewWrapper
                                key={job.id}
                                jobId={job.id}
                                onHover={showPreview}
                                onLeave={hidePreview}
                            >
                                <ListingJobCard job={job} />
                            </JobPreviewWrapper>
                        ))
                    ) : (
                        <div className="topcv-empty" style={{ padding: '40px 0' }}>
                            <div className="topcv-empty__icon">
                                <Search className="w-10 h-10" style={{ color: '#a6acb2' }} />
                            </div>
                            <h3 className="topcv-empty__title" style={{ fontSize: '1rem' }}>
                                {hasFilters
                                    ? 'Không tìm thấy việc làm phù hợp với bộ lọc'
                                    : 'Không tìm thấy việc làm nào'}
                            </h3>
                            {hasFilters && (
                                <button className="topcv-empty__button" onClick={clearFilters} type="button">
                                    Xoá bộ lọc
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <JobPagination
                        page={page}
                        totalPages={data?.totalPages ?? 0}
                        onPageChange={(nextPage) => updateFilters({ page: nextPage })}
                    />
                )}
            </div>

            {preview && (
                <JobPreviewPopup
                    job={preview.job}
                    isLoading={preview.isLoading}
                    anchorRect={preview.anchorRect}
                />
            )}
        </div>
    )
}

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
