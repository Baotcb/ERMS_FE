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

function WidgetListItem<T>({ item, renderFn }: { item: T; renderFn: (item: T) => React.ReactNode }) {
    return <>{renderFn(item)}</>
}

export function DashboardListWidget<T>({ title, subtitle, items, renderItem, keyExtractor, onRefresh }: DashboardListWidgetProps<T>) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[450px]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-[#0F4C75] text-lg uppercase">{title}</h3>
                    {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
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
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
                {items.length > 0 ? items.map((item, index) => (
                    <div key={keyExtractor ? keyExtractor(item, index) : index}>
                        <WidgetListItem item={item} renderFn={renderItem} />
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-[#0F4C75] text-lg uppercase">{title}</h3>
                    {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
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
            <div className="p-6 flex-1 flex flex-col justify-end">
                <div className="flex items-end justify-between gap-4 h-[250px] w-full">
                    {data.map((item) => (
                        <div key={item.label} className="flex flex-col items-center flex-1 gap-2 group">
                            <div className="relative w-full flex justify-center">
                                <div
                                    className="w-full max-w-[40px] rounded-t-sm transition-all duration-500 hover:opacity-80 relative group-hover:scale-105"
                                    style={{
                                        height: `${(item.value / maxValue) * 200}px`,
                                        backgroundColor: item.color
                                    }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {item.value}
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-500 text-center font-medium line-clamp-2 h-8 leading-3">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
