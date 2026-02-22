'use client'

import { useSyncExternalStore } from 'react'
import { motion } from 'framer-motion'
import { FileQuestion, Search } from 'lucide-react'
import { JobCard } from './job-card'
import { Button } from '@/components/ui/button'
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
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-xl shadow-sm border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-slate-50 p-6 rounded-full mb-6">
                    <FileQuestion className="w-16 h-16 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Chưa có công việc nào được lưu</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg">
                    Đừng bỏ lỡ cơ hội! Lưu các công việc bạn quan tâm để xem lại và ứng tuyển bất cứ lúc nào.
                </p>
                <Link href="/jobs">
                    <Button className="bg-[#00b14f] hover:bg-[#009643] text-white font-bold text-lg h-12 px-8 shadow-lg shadow-[#00b14f]/20 transition-transform active:scale-95">
                        <Search className="w-5 h-5 mr-2" />
                        Tìm việc làm ngay
                    </Button>
                </Link>
            </div>
        )
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {savedJobs.map((job) => (
                <motion.div key={job.id} variants={item} className="relative group h-full">
                    <Link href={`/jobs/${job.id}`} className="block h-full">
                        <JobCard {...job} />
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    )
}
