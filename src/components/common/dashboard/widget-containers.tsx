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
    const maxValue = Math.max(...data.map(d => d.value), 1) * 1.1

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
            <div className="p-4 flex-1 flex flex-col justify-end min-h-0">
                {data.length > 0 ? (
                    <div className="flex items-end justify-between gap-3 flex-1 w-full">
                        {data.map((item) => (
                            <div key={item.label} className="flex flex-col items-center flex-1 gap-1 group min-w-0">
                                <span className="text-xs font-bold text-gray-700">{item.value}</span>
                                <div className="relative w-full flex justify-center flex-1">
                                    <div
                                        className="w-full max-w-[48px] rounded-t-md transition-all duration-500 hover:opacity-80 group-hover:scale-105"
                                        style={{
                                            height: `${Math.max((item.value / maxValue) * 100, 8)}%`,
                                            backgroundColor: item.color
                                        }}
                                    />
                                </div>
                                <span className="text-[10px] text-gray-500 text-center font-medium leading-tight w-full truncate" title={item.label}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu</div>
                )}
            </div>
        </div>
    )
}
