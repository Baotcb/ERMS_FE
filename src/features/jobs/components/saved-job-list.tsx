'use client'

import { useSyncExternalStore } from 'react'
import { LazyMotion, m, domAnimation } from 'framer-motion'
import { FileQuestion, Search, ArrowRight } from 'lucide-react'
import { SavedJobCard } from './saved-job-card'
import { useSavedJobsStore } from '../stores/use-saved-jobs-store'
import Link from 'next/link'

const emptySubscribe = () => () => { }

export function SavedJobList() {
    const savedJobs = useSavedJobsStore((state) => state.savedJobs)

    const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

    if (!isMounted) {
        return null
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
        <LazyMotion features={domAnimation}>
            <m.div
                className="topcv-page__list"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {savedJobs.map((job) => (
                    <m.div key={job.id} variants={item}>
                        <Link href={`/jobs/${job.id}`} className="block" style={{ textDecoration: 'none' }}>
                            <SavedJobCard job={job} />
                        </Link>
                    </m.div>
                ))}
            </m.div>
        </LazyMotion>
    )
}
