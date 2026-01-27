'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileQuestion, Search, Trash2 } from 'lucide-react'
import { JobCard } from './job-card'
import { Button } from '@/components/ui/button'
import { MOCK_JOBS } from '../data/job-mock-data'
import { useToast } from "@/hooks/use-toast"

export function SavedJobList() {
    const [savedJobs, setSavedJobs] = useState(MOCK_JOBS.slice(0, 3))
    const { toast } = useToast()

    const handleRemoveJob = (id: number, title: string) => {
        setSavedJobs((prev) => prev.filter((job) => job.id !== id))
        toast({
            title: "Đã bỏ lưu công việc",
            description: title,
        })
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
                    <Button className="bg-brand-primary hover:bg-brand-primary/90 font-bold text-lg h-12 px-8 shadow-lg shadow-brand-primary/20 transition-transform active:scale-95">
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
                    <JobCard {...job} />

                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleRemoveJob(job.id, job.title)
                        }}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 z-10"
                        title="Bỏ lưu công việc này"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </motion.div>
            ))}
        </motion.div>
    )
}
