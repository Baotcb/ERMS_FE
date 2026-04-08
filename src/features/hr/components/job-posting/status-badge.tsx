import type { JobStatus } from '../../types/job-posting-types'

const config: Record<JobStatus, { bg: string; text: string; dot: string }> = {
    Published: { bg: 'bg-green-100 border-green-200/50', text: 'text-green-700', dot: 'bg-green-500' },
    Draft: { bg: 'bg-slate-100 border-slate-200/50', text: 'text-slate-600', dot: 'bg-slate-400' },
    Closed: { bg: 'bg-orange-100 border-orange-200/50', text: 'text-orange-700', dot: 'bg-orange-500' },
    Archived: { bg: 'bg-gray-100 border-gray-200/50', text: 'text-gray-700', dot: 'bg-gray-500' },
}

const labels: Record<JobStatus, string> = {
    Published: 'Đang tuyển',
    Draft: 'Nháp',
    Closed: 'Đã đóng',
    Archived: 'Lưu trữ',
}

export function StatusBadge({ status }: { status: JobStatus }) {
    const c = config[status] ?? config.Draft
    return (
        <span className={`inline-flex items-center justify-center min-w-[100px] px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0 ${c.dot}`} />
            {labels[status] ?? status}
        </span>
    )
}
