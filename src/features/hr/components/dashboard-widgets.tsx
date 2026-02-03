import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export { DashboardListWidget, DashboardChartWidget } from '@/components/common/dashboard/widget-containers'

// Helpers for list items
export function RequestItemRow({ title, date, requester, status }: { title: string, date: string, requester: string, status: string }) {
    const getStatusColor = (s: string) => {
        switch (s) {
            case 'urgent': return 'bg-red-100 text-red-600 border-red-200'
            case 'important': return 'bg-orange-100 text-orange-600 border-orange-200'
            default: return 'bg-green-100 text-green-600 border-green-200'
        }
    }

    // Checkboxes purely visual from image
    return (
        <div className="flex items-start gap-3 group cursor-pointer">
            <div className="mt-1 w-5 h-5 rounded-full border-2 border-gray-200 group-hover:border-[#0F4C75] transition-colors flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-[#0F4C75] transition-colors">{title}</p>
                <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={`text-[10px] px-1 py-0 h-4 ${getStatusColor(status)}`}>
                        {status === 'urgent' ? 'Khẩn cấp' : status === 'important' ? 'Quan trọng' : 'Hoàn thành'}
                    </Badge>
                    <span className="text-xs text-gray-400 truncate">Dự án: TĂNG TRƯỞNG &bull; {date}</span>
                </div>
            </div>
            <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-gray-100 text-xs">{requester.substring(0, 2)}</AvatarFallback>
            </Avatar>
        </div>
    )
}

export function TaskItemRow({ title, project, assignee }: { title: string, project: string, assignee: string }) {
    return (
        <div className="flex items-start gap-3 group cursor-pointer">
            <div className="mt-1 w-5 h-5 rounded-full border-2 border-gray-200 group-hover:border-[#0F4C75] transition-colors flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-[#0F4C75] transition-colors">{title}</p>
                <span className="text-xs text-gray-400 mt-1 block">Dự án: {project}</span>
            </div>
            <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-blue-50 text-[#0F4C75] text-xs">{assignee.substring(0, 2)}</AvatarFallback>
            </Avatar>
        </div>
    )
}

export function CandidateItemRow({ title, group, status }: { title: string, group: string, status: string }) {
    const isUrgent = status === 'urgent'

    return (
        <div className="flex items-start gap-3 group cursor-pointer border-b border-gray-50 pb-3 last:border-0 last:pb-0">
            <div className={`mt-1 w-4 h-4 rounded border flex-shrink-0 ${isUrgent ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-2">
                    {isUrgent && <span className="text-red-500 font-bold mr-1">[KHẨN CẤP]</span>}
                    {title}
                </p>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400 truncate max-w-[150px]">Nhóm: {group}</span>
                    <div className="flex -space-x-2">
                        <Avatar className="w-6 h-6 border-2 border-white">
                            <AvatarFallback className="bg-gray-100 text-[10px]">A</AvatarFallback>
                        </Avatar>
                        <Avatar className="w-6 h-6 border-2 border-white">
                            <AvatarFallback className="bg-gray-100 text-[10px]">B</AvatarFallback>
                        </Avatar>
                        <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[8px] text-white">4</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
