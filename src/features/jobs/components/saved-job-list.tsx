'use client'

import { useEffect, useState, useCallback } from 'react'
import { LazyMotion, m, domAnimation } from 'framer-motion'
import { FileQuestion, Search, ArrowRight, Loader2 } from 'lucide-react'
import { SavedJobCard } from './saved-job-card'
import { getMySavedPosts, type SavedPostDto } from '../api/saved-job-service'
import { getPublicJobById } from '../api/public-job-service'
import { useSavedJobsStore } from '../stores/use-saved-jobs-store'
import Link from 'next/link'

/** SavedPostDto enriched with extra fields from public API */
export interface EnrichedSavedPost extends SavedPostDto {
    enterpriseLogoUrl?: string
    salaryRangeMin?: number
    salaryRangeMax?: number
    showSalary?: boolean
    experienceLevel?: string
}

export function SavedJobList() {
    const [savedJobs, setSavedJobs] = useState<EnrichedSavedPost[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await getMySavedPosts(1, 50)
            setSavedJobs(response.items)
            setTotalCount(response.totalCount)

            // Enrich with logo + salary from public API (parallel, non-blocking)
            const enriched = await Promise.all(
                response.items.map(async (item) => {
                    try {
                        const detail = await getPublicJobById(item.jobPostingId)
                        if (detail) {
                            return {
                                ...item,
                                enterpriseLogoUrl: detail.enterpriseLogoUrl,
                                salaryRangeMin: detail.salaryRangeMin,
                                salaryRangeMax: detail.salaryRangeMax,
                                showSalary: detail.showSalary,
                                experienceLevel: detail.experienceLevel,
                            }
                        }
                    } catch {
                        // Ignore — giữ nguyên data gốc nếu lỗi
                    }
                    return item
                })
            )
            setSavedJobs(enriched)
        } catch {
            setError('Không thể tải danh sách việc làm đã lưu')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleUnsaved = useCallback((jobPostingId: string) => {
        setSavedJobs((prev) => prev.filter((j) => j.jobPostingId !== jobPostingId))
        setTotalCount((prev) => Math.max(0, prev - 1))
    }, [])

    // Sync store khi data load xong
    const fetchSavedJobIds = useSavedJobsStore((s) => s.fetchSavedJobIds)
    useEffect(() => {
        fetchSavedJobIds()
    }, [fetchSavedJobIds])

    if (isLoading) {
        return (
            <div className="topcv-empty">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#00b14f' }} />
                <p className="topcv-empty__text" style={{ marginTop: 16 }}>
                    Đang tải danh sách việc làm đã lưu...
                </p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="topcv-empty">
                <p className="topcv-empty__title" style={{ color: '#e74c3c' }}>{error}</p>
                <button className="topcv-empty__button" onClick={fetchData} type="button">
                    Thử lại
                </button>
            </div>
        )
    }

    if (savedJobs.length === 0) {
        return (
            <div className="topcv-empty">
                <div className="topcv-empty__icon">
                    <FileQuestion className="w-14 h-14" style={{ color: '#00b14f' }} />
                </div>
                <h3 className="topcv-empty__title">Bạn chưa lưu công việc nào!</h3>
                <p className="topcv-empty__text">
                    Đừng bỏ lỡ cơ hội! Lưu các công việc bạn quan tâm để xem lại và ứng tuyển bất cứ lúc nào.
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

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.06
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <>
            <p className="saved-job-list__count">
                Hiển thị <strong>{savedJobs.length}</strong> / {totalCount} việc làm đã lưu
            </p>
            <LazyMotion features={domAnimation}>
                <m.div
                    className="topcv-page__list"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    {savedJobs.map((job) => (
                        <m.div key={job.savedJobId} variants={item}>
                            <Link href={`/jobs/${job.jobPostingId}`} className="block" style={{ textDecoration: 'none' }}>
                                <SavedJobCard job={job} onUnsaved={handleUnsaved} />
                            </Link>
                        </m.div>
                    ))}
                </m.div>
            </LazyMotion>
        </>
    )
}
