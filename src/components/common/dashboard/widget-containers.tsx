import { RefreshCw, MoreHorizontal, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface DashboardListWidgetProps<T> {
    title: string
    subtitle?: string
    items: T[]
    renderItem: (item: T) => React.ReactNode
    keyExtractor?: (item: T, index: number) => React.Key
    onRefresh?: () => void
}

export function DashboardListWidget<T>({ title, subtitle, items, renderItem, keyExtractor, onRefresh }: DashboardListWidgetProps<T>) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                <div className="min-w-0">
                    <h3 className="font-bold text-[#0F4C75] text-xs uppercase truncate">{title}</h3>
                    {subtitle && <p className="text-[10px] text-gray-400 truncate">{subtitle}</p>}
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh}>
                        <RefreshCw className="w-4 h-4 text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </Button>
                </div>
            </div>
            <div className="px-3 py-2 flex-1 overflow-y-auto">
                {items.length > 0 ? items.map((item, index) => (
                    <div key={keyExtractor ? keyExtractor(item, index) : index} className="py-1.5 border-b border-gray-50 last:border-0">
                        {renderItem(item)}
                    </div>
                )) : (
                    <div className="text-center text-gray-400 py-8">Chưa có dữ liệu</div>
                )}
            </div>
        </div>
    )
}

export interface ChartData {
    label: string
    value: number
    color: string
}

export interface DashboardChartWidgetProps {
    title: string
    subtitle?: string
    data: ChartData[]
}

export function DashboardChartWidget({ title, subtitle, data }: DashboardChartWidgetProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                <div className="min-w-0">
                    <h3 className="font-bold text-[#0F4C75] text-xs uppercase truncate">{title}</h3>
                    {subtitle && <p className="text-[10px] text-gray-400 truncate">{subtitle}</p>}
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-gray-500">
                        <Filter className="w-3 h-3 mr-1" /> 1 bộ lọc
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <RefreshCw className="w-4 h-4 text-gray-400" />
                    </Button>
                </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
                {data.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {data.map((item) => (
                            <div key={item.label} className="w-full group">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-bold text-gray-700 truncate flex-1 pr-2" title={item.label}>
                                        {item.label}
                                    </span>
                                    <span className="text-xs font-bold tabular-nums" style={{ color: item.color }}>
                                        {item.value}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 by-gray-100 overflow-hidden shadow-inner">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110 flex items-center justify-end pr-1"
                                        style={{
                                            width: `${Math.min(Math.max(item.value, 0), 100)}%`,
                                            backgroundColor: item.color
                                        }}
                                    >
                                        {(item.value > 10) && <div className="w-1 h-1 bg-white/40 rounded-full" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu</div>
                )}
            </div>
        </div>
    )
}
