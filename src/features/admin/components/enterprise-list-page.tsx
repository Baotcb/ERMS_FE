'use client'

import { startTransition, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Building2, ChevronRight, Search, Settings2 } from 'lucide-react'
import {
  changeEnterpriseStatus,
  useEnterpriseList,
} from '@/features/admin/api/admin-service'
import { AdminDataTable, type Column } from '@/features/admin/components/admin-data-table'
import { EditStatusDrawer } from '@/features/admin/components/edit-status-drawer'
import { EnterpriseStatusBadge } from '@/features/admin/components/enterprise-status-badge'
import type {
  EnterpriseListFilters,
  EnterpriseListItem,
  EnterprisePlanTier,
  EnterpriseStatus,
} from '@/features/admin/types'

const DEFAULT_FILTERS: EnterpriseListFilters = {
  search: '',
  status: '',
  planTier: '',
  expiringWithinDays: '',
  pageNumber: 1,
  pageSize: 10,
}

const DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN')

function formatDate(value: string) {
  return DATE_FORMATTER.format(new Date(value))
}

function isExpiringSoon(value: string) {
  const endDate = new Date(value)
  const now = new Date()
  const inThirtyDays = new Date()
  inThirtyDays.setDate(now.getDate() + 30)

  return endDate >= now && endDate <= inThirtyDays
}

function normalizeLegacyPlanTier(value: string | null): EnterprisePlanTier | '' {
  if (!value) {
    return ''
  }

  const normalizedValue = value.trim().toLowerCase()

  if (normalizedValue === 'free' || normalizedValue === 'basic') {
    return 'Free'
  }

  if (
    normalizedValue === 'pro' ||
    normalizedValue === 'enterprise' ||
    normalizedValue === 'ent' ||
    normalizedValue === 'growth'
  ) {
    return 'Pro'
  }

  return ''
}

function parseFilters(searchParams: URLSearchParams): EnterpriseListFilters {
  return {
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') as EnterpriseStatus | '') || '',
    planTier: normalizeLegacyPlanTier(
      searchParams.get('planTier') || searchParams.get('planCode')
    ),
    expiringWithinDays: searchParams.get('expiringWithinDays')
      ? Number(searchParams.get('expiringWithinDays'))
      : '',
    pageNumber: Number(searchParams.get('pageNumber') || '1'),
    pageSize: Number(searchParams.get('pageSize') || '10'),
  }
}

export function EnterpriseListPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const filters = useMemo(
    () => parseFilters(searchParams),
    [searchParams]
  )
  const [selectedEnterprise, setSelectedEnterprise] = useState<
    Pick<EnterpriseListItem, 'id' | 'enterpriseName' | 'status'> | null
  >(null)

  const { data, isLoading, error } = useEnterpriseList(filters)

  const syncUrl = (nextFilters: EnterpriseListFilters) => {
    const params = new URLSearchParams()

    if (nextFilters.search) params.set('search', nextFilters.search)
    if (nextFilters.status) params.set('status', nextFilters.status)
    if (nextFilters.planTier) params.set('planTier', nextFilters.planTier)
    if (nextFilters.expiringWithinDays) {
      params.set(
        'expiringWithinDays',
        String(nextFilters.expiringWithinDays)
      )
    }
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

  const updateFilters = (patch: Partial<EnterpriseListFilters>) => {
    syncUrl({
      ...filters,
      ...patch,
    })
  }

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const search = String(formData.get('search') || '').trim()

    updateFilters({
      search,
      pageNumber: 1,
    })
  }

  const handleQuickFilter = (patch: Partial<EnterpriseListFilters>) => {
    updateFilters({
      ...patch,
      pageNumber: 1,
    })
  }

  const handleClearFilters = () => {
    syncUrl(DEFAULT_FILTERS)
  }

  const columns: Column<EnterpriseListItem>[] = useMemo(
    () => [
      {
        key: 'enterprise',
        header: 'Doanh nghiệp',
        render: (item) => (
          <div className="flex items-center gap-3">
            {item.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.logoUrl}
                alt={`${item.enterpriseName} logo`}
                className="h-10 w-10 rounded-xl border border-gray-100 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-sm font-bold text-indigo-700">
                {item.enterpriseName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {item.enterpriseName}
              </p>
              {isExpiringSoon(item.subscriptionEndDate) ? (
                <span className="mt-1 inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                  Sắp hết hạn
                </span>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        key: 'code',
        header: 'Mã',
        className: 'font-mono text-xs text-gray-500',
        render: (item) => item.enterpriseCode,
      },
      {
        key: 'contact',
        header: 'Liên hệ',
        className: 'text-sm text-gray-600',
        render: (item) => item.contactEmail || item.contactPhone || '—',
      },
      {
        key: 'status',
        header: 'Trạng thái',
        render: (item) => <EnterpriseStatusBadge status={item.status} />,
      },
      {
        key: 'plan',
        header: 'Gói hiện tại',
        className: 'text-sm font-medium text-gray-700',
        render: (item) => item.currentPlanName || '—',
      },
      {
        key: 'expiry',
        header: 'Hết hạn',
        className: 'text-sm text-gray-500',
        render: (item) => formatDate(item.subscriptionEndDate),
      },
      {
        key: 'actions',
        header: 'Thao tác',
        render: (item) => (
          <div className="flex items-center gap-3 text-sm">
            <Link
              href={`/admin/enterprises/${item.id}`}
              className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700"
            >
              Chi tiết
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setSelectedEnterprise(item)}
              className="font-medium text-gray-600 hover:text-gray-900"
            >
              Trạng thái
            </button>
            <Link
              href={`/admin/payments?enterprise=${encodeURIComponent(item.enterpriseName)}`}
              className="font-medium text-gray-600 hover:text-gray-900"
            >
              Thanh toán
            </Link>
          </div>
        ),
      },
    ],
    []
  )

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-8 text-center text-red-600">
        <p>Đã xảy ra lỗi khi tải dữ liệu doanh nghiệp.</p>
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

  const hasFilters =
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    Boolean(filters.planTier) ||
    Boolean(filters.expiringWithinDays)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">
          Quản lý doanh nghiệp
        </h1>
        <p className="text-sm text-gray-500">
          Danh sách và quản trị tenant trên nền tảng
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() =>
            handleQuickFilter({
              expiringWithinDays: 30,
              status: '',
              planTier: '',
            })
          }
          className={
            filters.expiringWithinDays === 30
              ? 'rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold text-amber-800'
              : 'rounded-full bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700'
          }
        >
          Sắp hết hạn
        </button>
        <button
          type="button"
          onClick={() =>
            handleQuickFilter({ status: 'Locked', expiringWithinDays: '' })
          }
          className={
            filters.status === 'Locked'
              ? 'rounded-full bg-red-100 px-4 py-1.5 text-xs font-semibold text-red-800'
              : 'rounded-full bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-700'
          }
        >
          Đã khóa
        </button>
        <button
          type="button"
          onClick={() =>
            handleQuickFilter({
              status: 'Suspended',
              expiringWithinDays: '',
            })
          }
          className={
            filters.status === 'Suspended'
              ? 'rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold text-amber-800'
              : 'rounded-full bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700'
          }
        >
          Tạm dừng
        </button>
        <button
          type="button"
          onClick={() =>
            handleQuickFilter({
              status: 'Inactive',
              expiringWithinDays: '',
            })
          }
          className={
            filters.status === 'Inactive'
              ? 'rounded-full bg-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-800'
              : 'rounded-full bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-700'
          }
        >
          Không hoạt động
        </button>
        {hasFilters ? (
          <button
            type="button"
            onClick={handleClearFilters}
            className="ml-2 text-xs font-medium text-indigo-600 hover:underline"
          >
            Xóa bộ lọc
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <form onSubmit={handleSearch} className="relative w-full lg:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            key={filters.search}
            name="search"
            type="search"
            defaultValue={filters.search}
            placeholder="Tìm theo tên, mã hoặc email doanh nghiệp..."
            className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300"
          />
        </form>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <select
            value={filters.status}
            onChange={(event) =>
              handleQuickFilter({
                status: event.target.value as EnterpriseStatus | '',
                expiringWithinDays: '',
              })
            }
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-indigo-300"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Hoạt động</option>
            <option value="Suspended">Tạm dừng</option>
            <option value="Locked">Đã khóa</option>
            <option value="Inactive">Ngừng HĐ</option>
          </select>

          <select
            value={filters.planTier}
            onChange={(event) =>
              handleQuickFilter({
                planTier: event.target.value as EnterprisePlanTier | '',
                pageNumber: 1,
              })
            }
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-indigo-300"
          >
            <option value="">Tất cả gói</option>
            <option value="Free">Free</option>
            <option value="Pro">Pro</option>
          </select>

          <div className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-600">
            <Settings2 className="h-4 w-4" aria-hidden="true" />
            Bộ lọc
          </div>
        </div>
      </div>

      <AdminDataTable
        columns={columns}
        data={data?.items}
        isLoading={isLoading}
        emptyIcon={<Building2 className="mx-auto h-12 w-12 text-gray-300" />}
        emptyMessage="Không tìm thấy doanh nghiệp phù hợp"
        pageNumber={filters.pageNumber}
        pageSize={filters.pageSize}
        totalCount={data?.totalCount}
        totalPages={data?.totalPages}
        onPageChange={(page) => updateFilters({ pageNumber: page })}
        keyExtractor={(item) => item.id}
      />

      <EditStatusDrawer
        open={selectedEnterprise !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEnterprise(null)
          }
        }}
        enterpriseId={selectedEnterprise?.id || ''}
        enterpriseName={selectedEnterprise?.enterpriseName || ''}
        currentStatus={selectedEnterprise?.status || 'Active'}
        onConfirm={async (payload) => {
          await changeEnterpriseStatus(payload)
          setSelectedEnterprise(null)
        }}
      />
    </div>
  )
}
