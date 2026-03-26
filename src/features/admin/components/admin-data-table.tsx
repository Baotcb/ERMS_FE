import React, { type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

export interface Column<T> {
  key: string
  header: ReactNode
  className?: string
  render: (item: T) => ReactNode
}

interface AdminDataTableProps<T> {
  columns: Column<T>[]
  data: T[] | undefined
  isLoading?: boolean
  emptyIcon?: ReactNode
  emptyMessage?: string
  pageNumber?: number
  pageSize?: number
  totalCount?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  keyExtractor: (item: T) => string
}

export function AdminDataTable<T>({
  columns,
  data,
  isLoading,
  emptyIcon,
  emptyMessage = 'Không có dữ liệu',
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  keyExtractor,
}: AdminDataTableProps<T>) {
  const colSpanCount = columns.length

  let showingStart = 0
  let showingEnd = 0

  if (totalCount && pageNumber && pageSize) {
    showingStart = (pageNumber - 1) * pageSize + 1
    showingEnd = Math.min(pageNumber * pageSize, totalCount)
  }

  const showPagination =
    typeof totalPages === 'number' && totalPages > 1 && onPageChange

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-max w-full border-collapse text-left">
          <thead className="border-b border-gray-100 bg-gray-50/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td
                  colSpan={colSpanCount}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                    <span className="text-sm">Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : !data || data.length === 0 ? (
              <tr>
                <td
                  colSpan={colSpanCount}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    {emptyIcon ? (
                      <div className="text-gray-400">{emptyIcon}</div>
                    ) : null}
                    <span className="text-sm">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="group transition-colors hover:bg-gray-50/50"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`whitespace-nowrap px-6 py-4 ${col.className || ''}`}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination ? (
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/50 px-6 py-4">
          <span className="text-xs font-medium text-gray-500">
            Hiển thị{' '}
            <span className="font-bold text-gray-900">
              {showingStart}-{showingEnd}
            </span>{' '}
            trên{' '}
            <span className="font-bold text-gray-900">{totalCount}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange?.((pageNumber || 1) - 1)}
              disabled={!pageNumber || pageNumber <= 1}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </button>

            <span className="hidden px-2 text-xs font-medium text-gray-600 sm:inline-block">
              Trang {pageNumber} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => onPageChange?.((pageNumber || 1) + 1)}
              disabled={!pageNumber || !totalPages || pageNumber >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Tiếp
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
