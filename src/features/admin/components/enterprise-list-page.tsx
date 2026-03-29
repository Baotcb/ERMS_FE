'use client'

import { startTransition, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Building2,
  ChevronRight,
  RefreshCw,
  Search,
  Settings2,
} from 'lucide-react'
import { LoadingSpinner } from '@/components/common'
import {
  changeEnterpriseStatus,
  revalidateEnterpriseList,
  useEnterpriseList,
} from '@/features/admin/api/admin-service'
import {
  AdminDataTable,
  type Column,
} from '@/features/admin/components/admin-data-table'
import { AdminEmptyState } from '@/features/admin/components/admin-empty-state'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import { AdminPanel } from '@/features/admin/components/admin-panel'
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

const FIELD_CLASSNAME =
  'h-11 w-full rounded-xl border border-slate-200/80 bg-white/90 px-3 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus-visible:ring-2 focus-visible:ring-teal-200 focus-visible:ring-offset-2'
const HEADER_ACTION_CLASSNAME =
  'inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 focus-visible:ring-offset-2'
const FILTER_BUTTON_CLASSNAME =
  'inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 focus-visible:ring-offset-2'

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

function getQuickChipClassName(
  active: boolean,
  tone: 'amber' | 'rose' | 'slate'
) {
  if (tone === 'rose') {
    return active
      ? 'inline-flex h-9 items-center rounded-full border border-rose-200 bg-rose-100 px-3.5 text-xs font-semibold text-rose-900'
      : 'inline-flex h-9 items-center rounded-full border border-rose-100 bg-rose-50/90 px-3.5 text-xs font-semibold text-rose-700 transition hover:border-rose-200 hover:bg-rose-100/80'
  }

  if (tone === 'slate') {
    return active
      ? 'inline-flex h-9 items-center rounded-full border border-slate-300 bg-slate-200 px-3.5 text-xs font-semibold text-slate-800'
      : 'inline-flex h-9 items-center rounded-full border border-slate-200 bg-slate-100/80 px-3.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-200/80'
  }

  return active
    ? 'inline-flex h-9 items-center rounded-full border border-amber-200 bg-amber-100 px-3.5 text-xs font-semibold text-amber-900'
    : 'inline-flex h-9 items-center rounded-full border border-amber-100 bg-amber-50/90 px-3.5 text-xs font-semibold text-amber-700 transition hover:border-amber-200 hover:bg-amber-100/80'
}

export function EnterpriseListPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
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
      params.set('expiringWithinDays', String(nextFilters.expiringWithinDays))
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

  const handleRetry = () => {
    void revalidateEnterpriseList(filters)
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
                className="h-10 w-10 rounded-xl border border-slate-200/80 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                {item.enterpriseName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[color:var(--admin-shell)]">
                {item.enterpriseName}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-medium text-slate-600">
                  {item.enterpriseCode}
                </span>
                {isExpiringSoon(item.subscriptionEndDate) ? (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-100">
                    Sắp hết hạn
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'contact',
        header: 'Liên hệ',
        className: 'text-sm text-slate-600',
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
        className: 'text-sm font-medium text-slate-700',
        render: (item) => item.currentPlanName || '—',
      },
      {
        key: 'expiry',
        header: 'Hết hạn',
        className: 'text-sm text-slate-500',
        render: (item) => formatDate(item.subscriptionEndDate),
      },
      {
        key: 'actions',
        header: 'Thao tác',
        className: 'w-[220px]',
        render: (item) => (
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/admin/enterprises/${item.id}`}
              className="inline-flex h-8 items-center gap-1 rounded-full bg-indigo-50 px-3 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 hover:text-indigo-800"
            >
              Chi tiết
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setSelectedEnterprise(item)}
              className="inline-flex h-8 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Trạng thái
            </button>
            <Link
              href={`/admin/payments?enterprise=${encodeURIComponent(item.enterpriseName)}`}
              className="inline-flex h-8 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Thanh toán
            </Link>
          </div>
        ),
      },
    ],
    []
  )

  const hasFilters =
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    Boolean(filters.planTier) ||
    Boolean(filters.expiringWithinDays)

  const activeFilterCount = [
    filters.search,
    filters.status,
    filters.planTier,
    filters.expiringWithinDays,
  ].filter(Boolean).length

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <AdminPageHeader
        title="Quản lý doanh nghiệp"
        description="Điểm điều phối tenant để lọc nhanh nhóm cần chú ý, rà soát trạng thái và đi tiếp vào chi tiết hoặc thanh toán."
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
                  Chọn một flow rõ ràng: định hướng, lọc danh sách, rồi kiểm tra từng tenant trong bảng.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {data?.totalCount?.toLocaleString('vi-VN') ?? 0} doanh nghiệp
            </span>
            {hasFilters ? (
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                {activeFilterCount} bộ lọc đang bật
              </span>
            ) : null}
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
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
              className={getQuickChipClassName(
                filters.expiringWithinDays === 30,
                'amber'
              )}
            >
              Sắp hết hạn
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickFilter({ status: 'Locked', expiringWithinDays: '' })
              }
              className={getQuickChipClassName(filters.status === 'Locked', 'rose')}
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
              className={getQuickChipClassName(
                filters.status === 'Suspended',
                'amber'
              )}
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
              className={getQuickChipClassName(
                filters.status === 'Inactive',
                'slate'
              )}
            >
              Không hoạt động
            </button>
          </div>

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(180px,0.8fr)_minmax(160px,0.7fr)_auto]">
            <form onSubmit={handleSearch} className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                key={filters.search}
                name="search"
                type="search"
                defaultValue={filters.search}
                aria-label="Tìm doanh nghiệp"
                placeholder="Tìm theo tên, mã hoặc email doanh nghiệp..."
                className={`${FIELD_CLASSNAME} pl-10 pr-4`}
              />
            </form>

            <select
              value={filters.status}
              aria-label="Lọc theo trạng thái doanh nghiệp"
              onChange={(event) =>
                handleQuickFilter({
                  status: event.target.value as EnterpriseStatus | '',
                  expiringWithinDays: '',
                })
              }
              className={FIELD_CLASSNAME}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Active">Hoạt động</option>
              <option value="Suspended">Tạm dừng</option>
              <option value="Locked">Đã khóa</option>
              <option value="Inactive">Ngừng HĐ</option>
            </select>

            <select
              value={filters.planTier}
              aria-label="Lọc theo gói doanh nghiệp"
              onChange={(event) =>
                handleQuickFilter({
                  planTier: event.target.value as EnterprisePlanTier | '',
                  pageNumber: 1,
                })
              }
              className={FIELD_CLASSNAME}
            >
              <option value="">Tất cả gói</option>
              <option value="Free">Free</option>
              <option value="Pro">Pro</option>
            </select>

            <button
              type="button"
              onClick={handleClearFilters}
              className={
                hasFilters
                  ? `${FILTER_BUTTON_CLASSNAME} border-slate-200 bg-white/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50`
                  : `${FILTER_BUTTON_CLASSNAME} cursor-not-allowed border-slate-200/70 bg-slate-100/70 text-slate-400`
              }
              disabled={!hasFilters}
            >
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
          icon={Building2}
          title="Không thể tải danh sách doanh nghiệp"
          description="Luồng điều phối tenant đang tạm gián đoạn. Thử làm mới lại đúng dataset hiện tại để tiếp tục rà soát mà không mất ngữ cảnh lọc."
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
          emptyIcon={<Building2 className="mx-auto h-12 w-12 text-slate-300" />}
          emptyMessage="Không tìm thấy doanh nghiệp phù hợp"
          pageNumber={filters.pageNumber}
          pageSize={filters.pageSize}
          totalCount={data?.totalCount}
          totalPages={data?.totalPages}
          onPageChange={(page) => updateFilters({ pageNumber: page })}
          keyExtractor={(item) => item.id}
        />
      )}

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
