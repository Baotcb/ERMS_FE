'use client'

import { startTransition, useMemo, type FormEvent } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CreditCard, RefreshCw, RotateCcw, Search, Settings2 } from 'lucide-react'
import { LoadingSpinner } from '@/components/common'
import {
  revalidateGlobalPaymentHistory,
  useGlobalPaymentHistory,
} from '@/features/admin/api/admin-service'
import {
  AdminDataTable,
  type Column,
} from '@/features/admin/components/admin-data-table'
import { AdminEmptyState } from '@/features/admin/components/admin-empty-state'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import { AdminPanel } from '@/features/admin/components/admin-panel'
import type {
  PaymentActionType,
  PaymentHistoryFilters,
  PaymentHistoryItem,
} from '@/features/admin/types'

const ACTION_TYPE_LABELS: Record<string, string> = {
  Subscribe: 'Đăng ký',
  Renew: 'Gia hạn',
  Upgrade: 'Nâng cấp',
  Downgrade: 'Hạ cấp',
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  BankTransfer: 'Chuyển khoản',
  Cash: 'Tiền mặt',
  Card: 'Thẻ',
}

const DEFAULT_FILTERS: PaymentHistoryFilters = {
  enterpriseSearch: '',
  actionType: '',
  paymentMethod: '',
  dateFrom: '',
  dateTo: '',
  pageNumber: 1,
  pageSize: 20,
}

const DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN')
const CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const FIELD_CLASSNAME =
  'h-11 w-full rounded-xl border border-slate-200/80 bg-white/90 px-3 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus-visible:ring-2 focus-visible:ring-teal-200 focus-visible:ring-offset-2'
const HEADER_ACTION_CLASSNAME =
  'inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 focus-visible:ring-offset-2'
const FILTER_BUTTON_CLASSNAME =
  'inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 focus-visible:ring-offset-2'

function parseFilters(searchParams: URLSearchParams): PaymentHistoryFilters {
  return {
    enterpriseSearch:
      searchParams.get('enterprise') ||
      searchParams.get('enterpriseSearch') ||
      '',
    actionType:
      (searchParams.get('actionType') as PaymentActionType | '') || '',
    paymentMethod: searchParams.get('paymentMethod') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    pageNumber: Number(searchParams.get('pageNumber') || '1'),
    pageSize: Number(searchParams.get('pageSize') || '20'),
  }
}

function formatDate(value: string) {
  return DATE_FORMATTER.format(new Date(value))
}

function formatCurrency(amount: number, currency: string) {
  if (currency === 'VND') {
    return CURRENCY_FORMATTER.format(amount)
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function PaymentHistoryPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])

  const { data, isLoading, error } = useGlobalPaymentHistory(filters)

  const syncUrl = (nextFilters: PaymentHistoryFilters) => {
    const params = new URLSearchParams()

    if (nextFilters.enterpriseSearch) {
      params.set('enterpriseSearch', nextFilters.enterpriseSearch)
    }
    if (nextFilters.actionType) {
      params.set('actionType', nextFilters.actionType)
    }
    if (nextFilters.paymentMethod) {
      params.set('paymentMethod', nextFilters.paymentMethod)
    }
    if (nextFilters.dateFrom) params.set('dateFrom', nextFilters.dateFrom)
    if (nextFilters.dateTo) params.set('dateTo', nextFilters.dateTo)
    if (nextFilters.pageNumber > 1) {
      params.set('pageNumber', String(nextFilters.pageNumber))
    }
    if (nextFilters.pageSize !== DEFAULT_FILTERS.pageSize) {
      params.set('pageSize', String(nextFilters.pageSize))
    }

    startTransition(() => {
      const queryString = params.toString()
      router.replace(queryString ? `${pathname}?${queryString}` : pathname)
    })
  }

  const updateFilters = (patch: Partial<PaymentHistoryFilters>) => {
    syncUrl({
      ...filters,
      ...patch,
    })
  }

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const enterpriseSearch = String(formData.get('enterpriseSearch') || '').trim()

    updateFilters({
      enterpriseSearch,
      pageNumber: 1,
    })
  }

  const handleResetFilters = () => {
    syncUrl(DEFAULT_FILTERS)
  }

  const handleRetry = () => {
    void revalidateGlobalPaymentHistory(filters)
  }

  const columns: Column<PaymentHistoryItem>[] = useMemo(
    () => [
      {
        key: 'enterprise',
        header: 'Doanh nghiệp',
        render: (item) => (
          <div className="flex flex-col">
            <Link
              href={`/admin/enterprises/${item.enterpriseId}`}
              className="text-sm font-semibold text-[color:var(--admin-shell)] transition hover:text-indigo-700 hover:underline"
            >
              {item.enterpriseName}
            </Link>
            <span className="mt-1 inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-medium text-slate-600">
              {item.enterpriseCode}
            </span>
          </div>
        ),
      },
      {
        key: 'actionType',
        header: 'Loại thao tác',
        render: (item) => (
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
            {ACTION_TYPE_LABELS[item.actionType] || item.actionType}
          </span>
        ),
      },
      {
        key: 'plan',
        header: 'Gói',
        className: 'text-sm font-medium text-slate-800',
        render: (item) => item.planName || '—',
      },
      {
        key: 'previousPlan',
        header: 'Gói trước',
        className: 'text-sm text-slate-500',
        render: (item) => item.previousPlanName || '—',
      },
      {
        key: 'amount',
        header: 'Số tiền',
        className: 'text-right text-sm font-semibold text-[color:var(--admin-shell)]',
        render: (item) => formatCurrency(item.amount, item.currency),
      },
      {
        key: 'method',
        header: 'Phương thức',
        className: 'text-sm text-slate-600',
        render: (item) =>
          item.paymentMethod
            ? PAYMENT_METHOD_LABELS[item.paymentMethod] || item.paymentMethod
            : '—',
      },
      {
        key: 'period',
        header: 'Thời hạn',
        className: 'text-sm text-slate-600',
        render: (item) =>
          `${formatDate(item.periodStartDate)} - ${formatDate(item.periodEndDate)}`,
      },
      {
        key: 'date',
        header: 'Ngày',
        className: 'text-sm text-slate-600',
        render: (item) => formatDate(item.createdAt),
      },
    ],
    []
  )

  const hasActiveFilters =
    Boolean(filters.enterpriseSearch) ||
    Boolean(filters.actionType) ||
    Boolean(filters.paymentMethod) ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo)

  const activeFilterCount = [
    filters.enterpriseSearch,
    filters.actionType,
    filters.paymentMethod,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <AdminPageHeader
        title="Lịch sử thanh toán"
        description="Ledger vận hành để lần theo giao dịch subscription theo doanh nghiệp, hành động, thời gian và phương thức trong cùng một surface."
        actions={
          <button
            type="button"
            onClick={handleRetry}
            className={HEADER_ACTION_CLASSNAME}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Làm mới dữ liệu
          </button>
        }
      />

      <AdminPanel className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-slate-200/80 px-6 py-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Settings2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[color:var(--admin-shell)]">
                  Workspace bộ lọc
                </h2>
                <p className="text-sm text-slate-600">
                  Tập trung một luồng làm việc: tìm giao dịch, khóa phạm vi thời gian, rồi đối soát trực tiếp trong bảng.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {data?.totalCount?.toLocaleString('vi-VN') ?? 0} giao dịch
            </span>
            {hasActiveFilters ? (
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                {activeFilterCount} bộ lọc đang bật
              </span>
            ) : null}
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(180px,0.8fr)_minmax(190px,0.8fr)_minmax(150px,0.6fr)_minmax(150px,0.6fr)_auto]">
            <form onSubmit={handleSearch} className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                key={filters.enterpriseSearch}
                name="enterpriseSearch"
                type="search"
                defaultValue={filters.enterpriseSearch}
                placeholder="Tìm doanh nghiệp..."
                className={`${FIELD_CLASSNAME} pl-10 pr-4`}
              />
            </form>

            <select
              value={filters.actionType}
              onChange={(event) =>
                updateFilters({
                  actionType: event.target.value as PaymentActionType | '',
                  pageNumber: 1,
                })
              }
              className={FIELD_CLASSNAME}
            >
              <option value="">Tất cả thao tác</option>
              <option value="Subscribe">Đăng ký</option>
              <option value="Renew">Gia hạn</option>
              <option value="Upgrade">Nâng cấp</option>
              <option value="Downgrade">Hạ cấp</option>
            </select>

            <select
              value={filters.paymentMethod}
              onChange={(event) =>
                updateFilters({
                  paymentMethod: event.target.value,
                  pageNumber: 1,
                })
              }
              className={FIELD_CLASSNAME}
            >
              <option value="">Mọi phương thức</option>
              <option value="BankTransfer">Chuyển khoản</option>
              <option value="Cash">Tiền mặt</option>
              <option value="Card">Thẻ</option>
            </select>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) =>
                updateFilters({ dateFrom: event.target.value, pageNumber: 1 })
              }
              className={FIELD_CLASSNAME}
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) =>
                updateFilters({ dateTo: event.target.value, pageNumber: 1 })
              }
              className={FIELD_CLASSNAME}
            />

            <button
              type="button"
              onClick={handleResetFilters}
              className={
                hasActiveFilters
                  ? `${FILTER_BUTTON_CLASSNAME} border-slate-200 bg-white/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50`
                  : `${FILTER_BUTTON_CLASSNAME} cursor-not-allowed border-slate-200/70 bg-slate-100/70 text-slate-400`
              }
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </AdminPanel>

      {isLoading && !data ? (
        <AdminPanel className="flex min-h-[320px] items-center justify-center">
          <div
            className="flex flex-col items-center justify-center gap-3 text-slate-600"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <LoadingSpinner size="lg" className="text-teal-600" />
            <span className="text-sm font-medium">Đang tải...</span>
          </div>
        </AdminPanel>
      ) : error ? (
        <AdminEmptyState
          icon={CreditCard}
          title="Không thể tải lịch sử thanh toán"
          description="Bảng ledger đang tạm mất kết nối với backend. Thử revalidate lại đúng tập lọc hiện tại để tiếp tục đối soát mà không phải làm lại thao tác."
          action={
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--admin-shell)] px-4 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Thử lại
            </button>
          }
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={data?.items}
          isLoading={isLoading}
          emptyIcon={<CreditCard className="mx-auto h-12 w-12 text-slate-300" />}
          emptyMessage="Không có giao dịch phù hợp"
          pageNumber={filters.pageNumber}
          pageSize={filters.pageSize}
          totalCount={data?.totalCount}
          totalPages={data?.totalPages}
          onPageChange={(page) => updateFilters({ pageNumber: page })}
          keyExtractor={(item) => item.id}
        />
      )}
    </div>
  )
}
