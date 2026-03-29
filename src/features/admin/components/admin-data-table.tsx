import React, { type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: ReactNode;
  headerClassName?: string;
  className?: string;
  render: (item: T) => ReactNode;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[] | undefined;
  isLoading?: boolean;
  emptyIcon?: ReactNode;
  emptyMessage?: string;
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  keyExtractor: (item: T) => string;
}

export function AdminDataTable<T>({
  columns,
  data,
  isLoading,
  emptyIcon,
  emptyMessage = "Không có dữ liệu",
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  keyExtractor,
}: AdminDataTableProps<T>) {
  const colSpanCount = columns.length;

  let showingStart = 0;
  let showingEnd = 0;

  if (totalCount && pageNumber && pageSize) {
    showingStart = (pageNumber - 1) * pageSize + 1;
    showingEnd = Math.min(pageNumber * pageSize, totalCount);
  }

  const showPagination = Boolean(
    typeof totalPages === "number" && totalPages > 1 && onPageChange,
  );
  const headerPaddingClassName = "px-5 py-3 first:pl-6 last:pr-6";
  const cellPaddingClassName = "px-5 py-4 first:pl-6 last:pr-6";

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border admin-panel"
      aria-busy={isLoading || undefined}
    >
      <div className="overflow-x-auto">
        <table
          className="min-w-full border-collapse text-left"
          aria-busy={isLoading || undefined}
        >
          <thead className="border-b border-slate-200/70 bg-white/45">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    headerPaddingClassName,
                    "whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500",
                    col.headerClassName,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100/80 text-sm text-slate-700">
            {isLoading ? (
              <tr>
                <td
                  colSpan={colSpanCount}
                  className="px-6 py-16 text-center text-slate-500"
                >
                  <div
                    className="flex flex-col items-center justify-center gap-3"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                    <span className="text-sm">Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : !data || data.length === 0 ? (
              <tr>
                <td
                  colSpan={colSpanCount}
                  className="px-6 py-16 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    {emptyIcon ? (
                      <div className="text-slate-400/80">{emptyIcon}</div>
                    ) : null}
                    <span className="text-sm">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="transition-colors duration-150 hover:bg-slate-50/80"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        cellPaddingClassName,
                        "align-middle whitespace-nowrap",
                        col.className,
                      )}
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
        <div className="flex flex-col gap-3 border-t border-slate-200/70 bg-white/45 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="text-xs font-medium text-slate-500">
            Hiển thị{" "}
            <span className="font-semibold text-[color:var(--admin-shell)]">
              {showingStart}-{showingEnd}
            </span>{" "}
            trên{" "}
            <span className="font-semibold text-[color:var(--admin-shell)]">
              {totalCount}
            </span>
          </span>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onPageChange?.((pageNumber || 1) - 1)}
              disabled={!pageNumber || pageNumber <= 1}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </button>

            <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 sm:inline-block">
              Trang {pageNumber} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => onPageChange?.((pageNumber || 1) + 1)}
              disabled={!pageNumber || !totalPages || pageNumber >= totalPages}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Tiếp
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
