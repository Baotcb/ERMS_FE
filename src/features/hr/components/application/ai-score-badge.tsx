import { cn } from '@/lib/utils'

export function AIScoreBadge({ score }: { score: number }) {
    const percentage = Math.min(Math.max(score, 0), 100)

    let colorClass = 'text-red-600 bg-red-50'
    let progressClass = 'bg-red-500'

    if (percentage >= 80) {
        colorClass = 'text-green-600 bg-green-50'
        progressClass = 'bg-green-500'
    } else if (percentage >= 60) {
        colorClass = 'text-blue-600 bg-blue-50'
        progressClass = 'bg-blue-500'
    } else if (percentage >= 40) {
        colorClass = 'text-yellow-600 bg-yellow-50'
        progressClass = 'bg-yellow-500'
    }

    return (
        <div className="flex items-center gap-2 min-w-[120px]">
            <div className={cn("px-2 py-0.5 rounded text-xs font-bold w-[40px] text-center", colorClass)}>
                {percentage}%
            </div>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all duration-500 ease-out", progressClass)}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}
