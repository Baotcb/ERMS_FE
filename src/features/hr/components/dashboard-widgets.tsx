import { memo } from 'react'
import { Badge } from '@/components/ui/badge'

export { DashboardListWidget, DashboardChartWidget } from '@/components/common/dashboard/widget-containers'

// Compact single-row request item: [status badge] [title] [department] [date]
export const RequestItemRow = memo(function RequestItemRow({ title, date, requester, status, project, onClick }: { title: string, date: string, requester: string, status: string, project?: string, onClick?: () => void }) {
    const getStatusColor = (s: string) => {
        switch (s) {
            case 'urgent': return 'bg-red-100 text-red-600 border-red-200'
            case 'important': return 'bg-orange-100 text-orange-600 border-orange-200'
            default: return 'bg-green-100 text-green-600 border-green-200'
        }
    }

    return (
        <div className="flex items-center gap-2 group cursor-pointer hover:bg-slate-50 px-1 py-0.5 rounded transition-all active:scale-[0.99]" role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() } }}>
            <Badge variant="outline" className={`text-[9px] px-1 py-0 h-3.5 whitespace-nowrap flex-shrink-0 ${getStatusColor(status)}`}>
                {status === 'urgent' ? 'Khẩn' : 'Cần tạo'}
            </Badge>
            <span className="text-[11px] font-medium text-gray-800 truncate flex-1 group-hover:text-[#0F4C75] transition-colors">{title}</span>
            <span className="text-[10px] text-gray-400 truncate max-w-[80px] flex-shrink-0">{requester}</span>
            {project && <span className="text-[9px] text-gray-300 flex-shrink-0">{project}</span>}
            <span className="text-[10px] text-gray-300 flex-shrink-0 whitespace-nowrap">{date}</span>
        </div>
    )
})

import Link from 'next/link'

export const TaskItemRow = memo(function TaskItemRow({ title, project, assignee, link }: { title: string, project: string, assignee: string, link?: string }) {
    const Content = (
        <div className="flex items-center gap-2 group cursor-pointer px-1 py-0.5">
            <div className="w-3 h-3 rounded-full border-2 border-gray-200 group-hover:border-[#0F4C75] transition-colors flex-shrink-0" />
            <span className="text-[11px] font-medium text-gray-800 truncate flex-1 group-hover:text-[#0F4C75] transition-colors">{title}</span>
            <span className="text-[10px] text-gray-400 truncate max-w-[80px] flex-shrink-0">{project}</span>
            <span className="text-[10px] text-gray-300 flex-shrink-0">{assignee}</span>
        </div>
    )

    if (link) {
        return <Link href={link} className="block">{Content}</Link>
    }

    return Content
})

export const CandidateItemRow = memo(function CandidateItemRow({ title, group, status }: { title: string, group: string, status: string }) {
    const isUrgent = status === 'urgent'

    return (
        <div className="flex items-center gap-2 group cursor-pointer px-1 py-0.5">
            <div className={`w-3 h-3 rounded border flex-shrink-0 ${isUrgent ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
            <span className="text-[11px] font-medium text-gray-800 truncate flex-1">
                {isUrgent && <span className="text-red-500 font-bold mr-1">[!]</span>}
                {title}
            </span>
            <span className="text-[10px] text-gray-400 flex-shrink-0">{group}</span>
        </div>
    )
})
