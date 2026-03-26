'use client'

import Link from 'next/link'
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Loader2,
  RefreshCw,
  Users,
} from 'lucide-react'
import { usePlatformStats } from '@/features/admin/api/admin-service'
import { EnterpriseStatusBadge } from '@/features/admin/components/enterprise-status-badge'

const CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})
const DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN')

function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount)
}

function formatDate(value: string) {
  return DATE_FORMATTER.format(new Date(value))
}

export function PlatformDashboardPageContent() {
  const { data: stats, isLoading, error } = usePlatformStats()

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-red-100 bg-white p-8 text-center text-red-600 shadow-sm">
        <p className="font-medium">Không thể tải dữ liệu Platform Dashboard.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-indigo-50 px-4 py-2 font-semibold text-indigo-700"
        >
          Thử lại
        </button>
      </div>
    )
  }

  const statusTotal = stats.totalEnterprises || 1
  const maxTierCount = Math.max(
    ...stats.subscriptionMix.map((item) => item.count),
    1
  )

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
        <p className="text-sm text-gray-500">
          KPI kinh doanh và sức khỏe tổng quan nền tảng
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Building2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Tổng doanh nghiệp
              </p>
              <p className="mt-1 text-2xl font-black text-gray-900">
                {stats.totalEnterprises.toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <Users className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Đang hoạt động
              </p>
              <p className="mt-1 text-2xl font-black text-gray-900">
                {stats.activeEnterprises.toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <BarChart3 className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                MRR tháng này
              </p>
              <p className="mt-1 text-2xl font-black text-gray-900">
                {formatCurrency(stats.mrrCurrentMonth)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <RefreshCw className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Tỉ lệ gia hạn
              </p>
              <p className="mt-1 text-2xl font-black text-gray-900">
                {stats.renewalRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">
              Phân bố trạng thái doanh nghiệp
            </h2>
          </div>
          <div className="space-y-5 p-6">
            {stats.statusDistribution.map((item) => {
              const percentage = Math.round((item.count / statusTotal) * 100)

              return (
                <div key={item.status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <EnterpriseStatusBadge status={item.status} />
                    <span className="text-sm font-semibold text-gray-700">
                      {item.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-indigo-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">
              Subscription Mix
            </h2>
          </div>
          <div className="space-y-5 p-6">
            {stats.subscriptionMix.map((item) => {
              const width = Math.round((item.count / maxTierCount) * 100)

              return (
                <div key={item.tierName} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      {item.tierName}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-100">
                    <div
                      className="h-2.5 rounded-full bg-indigo-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">
              Top doanh nghiệp
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.topEnterprises.length > 0 ? (
              stats.topEnterprises.map((item, index) => (
                <div
                  key={item.enterpriseId}
                  className="flex items-center gap-3 px-6 py-4"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/enterprises/${item.enterpriseId}`}
                      className="truncate text-sm font-semibold text-gray-900 hover:text-indigo-700 hover:underline"
                    >
                      {item.enterpriseName}
                    </Link>
                    <p className="text-xs text-gray-500">{item.metric}</p>
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    {item.value.toLocaleString('vi-VN')}
                  </div>
                </div>
              ))
            ) : (
              <p className="px-6 py-10 text-sm text-gray-500">
                Chưa có dữ liệu xếp hạng doanh nghiệp.
              </p>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-6 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
            <h2 className="text-lg font-bold text-gray-900">
              Renewal / Churn Watchlist
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.churnWatchlist.length > 0 ? (
              stats.churnWatchlist.map((item) => (
                <div
                  key={item.enterpriseId}
                  className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/admin/enterprises/${item.enterpriseId}`}
                      className="text-sm font-semibold text-gray-900 hover:text-indigo-700 hover:underline"
                    >
                      {item.enterpriseName}
                    </Link>
                    <p className="mt-1 text-sm text-gray-600">
                      {item.riskReason}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Hết hạn:{' '}
                    <span className="font-semibold text-gray-700">
                      {formatDate(item.subscriptionEndDate)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-6 py-10 text-sm text-gray-500">
                Hiện chưa có doanh nghiệp nào nằm trong danh sách cần theo dõi.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
