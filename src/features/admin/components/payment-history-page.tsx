'use client'

import { startTransition, useMemo, type FormEvent } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CreditCard, RotateCcw, Search } from 'lucide-react'
import { useGlobalPaymentHistory } from '@/features/admin/api/admin-service'
import { AdminDataTable, type Column } from '@/features/admin/components/admin-data-table'
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

  const columns: Column<PaymentHistoryItem>[] = useMemo(
    () => [
      {
        key: 'enterprise',
        header: 'Doanh nghiệp',
        render: (item) => (
          <div className="flex flex-col">
            <Link
              href={`/admin/enterprises/${item.enterpriseId}`}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              {item.enterpriseName}
            </Link>
            <span className="mt-0.5 font-mono text-xs text-gray-500">
              {item.enterpriseCode}
            </span>
          </div>
        ),
      },
      {
        key: 'actionType',
        header: 'Loại thao tác',
        render: (item) => (
          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700">
            {ACTION_TYPE_LABELS[item.actionType] || item.actionType}
          </span>
        ),
      },
      {
        key: 'plan',
        header: 'Gói',
        className: 'text-sm font-medium text-gray-900',
        render: (item) => item.planName || '—',
      },
      {
        key: 'previousPlan',
        header: 'Gói trước',
        className: 'text-sm text-gray-500',
        render: (item) => item.previousPlanName || '—',
      },
      {
        key: 'amount',
        header: 'Số tiền',
        className: 'text-right text-sm font-bold text-gray-900',
        render: (item) => formatCurrency(item.amount, item.currency),
      },
      {
        key: 'method',
        header: 'Phương thức',
        className: 'text-sm text-gray-600',
        render: (item) =>
          item.paymentMethod
            ? PAYMENT_METHOD_LABELS[item.paymentMethod] || item.paymentMethod
            : '—',
      },
      {
        key: 'period',
        header: 'Thời hạn',
        className: 'text-sm text-gray-600',
        render: (item) =>
          `${formatDate(item.periodStartDate)} - ${formatDate(item.periodEndDate)}`,
      },
      {
        key: 'date',
        header: 'Ngày',
        className: 'text-sm text-gray-600',
        render: (item) => formatDate(item.createdAt),
      },
    ],
    []
  )

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-8 text-center text-red-600">
        <p>Đã xảy ra lỗi khi tải lịch sử thanh toán.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 font-medium text-indigo-600 hover:underline"
        >
          Thử lại
        </button>
      </div>
    )
  }

  const hasActiveFilters =
    Boolean(filters.enterpriseSearch) ||
    Boolean(filters.actionType) ||
    Boolean(filters.paymentMethod) ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Lịch sử thanh toán</h1>
        <p className="text-sm text-gray-500">
          Ledger thanh toán subscription toàn nền tảng
        </p>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <form onSubmit={handleSearch} className="relative w-full xl:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            key={filters.enterpriseSearch}
            name="enterpriseSearch"
            type="search"
            defaultValue={filters.enterpriseSearch}
            placeholder="Tìm doanh nghiệp..."
            className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.actionType}
            onChange={(event) =>
              updateFilters({
                actionType: event.target.value as PaymentActionType | '',
                pageNumber: 1,
              })
            }
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-indigo-300"
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
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-indigo-300"
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
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-indigo-300"
          />

          <input
            type="date"
            value={filters.dateTo}
            onChange={(event) =>
              updateFilters({ dateTo: event.target.value, pageNumber: 1 })
            }
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-indigo-300"
          />

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Xóa bộ lọc
            </button>
          ) : null}
        </div>
      </div>

      <AdminDataTable
        columns={columns}
        data={data?.items}
        isLoading={isLoading}
        emptyIcon={<CreditCard className="mx-auto h-12 w-12 text-gray-300" />}
        emptyMessage="Không có giao dịch phù hợp"
        pageNumber={filters.pageNumber}
        pageSize={filters.pageSize}
        totalCount={data?.totalCount}
        totalPages={data?.totalPages}
        onPageChange={(page) => updateFilters({ pageNumber: page })}
        keyExtractor={(item) => item.id}
      />
    </div>
  )
}
