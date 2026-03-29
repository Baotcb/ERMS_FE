'use client'

import Link from 'next/link'
import {
  AlertTriangle,
  BarChart3,
  Building2,
  RefreshCw,
  Users,
} from 'lucide-react'
import { LoadingSpinner } from '@/components/common'
import { usePlatformStats } from '@/features/admin/api/admin-service'
import { AdminEmptyState } from '@/features/admin/components/admin-empty-state'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import { AdminPanel } from '@/features/admin/components/admin-panel'
import { AdminStatCard } from '@/features/admin/components/admin-stat-card'
import { EnterpriseStatusBadge } from '@/features/admin/components/enterprise-status-badge'

const CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})
const DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN')

const HEADER_ACTION_CLASSNAME =
  'inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 focus-visible:ring-offset-2'

function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount)
}

function formatDate(value: string) {
  return DATE_FORMATTER.format(new Date(value))
}

export function PlatformDashboardPageContent() {
  const { data: stats, isLoading, error } = usePlatformStats()

  const statusTotal = stats?.totalEnterprises || 1
  const maxTierCount =
    stats && stats.subscriptionMix.length > 0
      ? Math.max(...stats.subscriptionMix.map((item) => item.count), 1)
      : 1

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <AdminPageHeader
        title="Platform Dashboard"
        description="Theo dõi KPI kinh doanh, phân bố tenant và các tín hiệu gia hạn hoặc churn cần admin can thiệp."
        actions={
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={HEADER_ACTION_CLASSNAME}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Làm mới dữ liệu
          </button>
        }
      />

      {isLoading && !stats ? (
        <AdminPanel className="flex min-h-[320px] items-center justify-center">
          <LoadingSpinner size="lg" className="text-teal-600" />
        </AdminPanel>
      ) : error || !stats ? (
        <AdminEmptyState
          icon={BarChart3}
          title="Không thể tải Platform Dashboard"
          description="Các thống kê kinh doanh và watchlist chưa thể đồng bộ từ backend. Bạn có thể tải lại để thử lại request."
          action={
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--admin-shell)] px-4 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Thử lại
            </button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              title="Tổng doanh nghiệp"
              value={stats.totalEnterprises.toLocaleString('vi-VN')}
              icon={Building2}
              color="indigo"
            />
            <AdminStatCard
              title="Đang hoạt động"
              value={stats.activeEnterprises.toLocaleString('vi-VN')}
              icon={Users}
              color="green"
            />
            <AdminStatCard
              title="MRR tháng này"
              value={formatCurrency(stats.mrrCurrentMonth)}
              icon={BarChart3}
              color="blue"
            />
            <AdminStatCard
              title="Tỷ lệ gia hạn"
              value={`${stats.renewalRate.toFixed(1)}%`}
              icon={RefreshCw}
              color="amber"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] xl:items-start">
            <div className="space-y-6">
              <AdminPanel className="overflow-hidden p-0">
                <div className="flex flex-col gap-3 border-b border-slate-200/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[color:var(--admin-shell)]">
                      Phân bố trạng thái doanh nghiệp
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Tỷ lệ tenant theo trạng thái hiện tại trên toàn platform.
                    </p>
                  </div>
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {stats.totalEnterprises.toLocaleString('vi-VN')} doanh nghiệp
                  </span>
                </div>

                {stats.statusDistribution.length > 0 ? (
                  <div className="space-y-5 px-6 py-6">
                    {stats.statusDistribution.map((item) => {
                      const percentage = Math.round(
                        (item.count / statusTotal) * 100
                      )

                      return (
                        <div key={item.status} className="space-y-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <EnterpriseStatusBadge status={item.status} />
                            <span className="text-sm font-semibold text-slate-700">
                              {item.count.toLocaleString('vi-VN')} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-slate-100">
                            <div
                              className="h-3 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <AdminEmptyState
                    icon={Users}
                    title="Chưa có dữ liệu trạng thái"
                    description="Biểu đồ phân bố trạng thái sẽ hiển thị khi backend trả về thống kê tenant."
                    className="min-h-[260px] rounded-none border-0 shadow-none"
                  />
                )}
              </AdminPanel>

              <AdminPanel className="overflow-hidden p-0">
                <div className="border-b border-slate-200/80 px-6 py-5">
                  <h2 className="text-lg font-semibold text-[color:var(--admin-shell)]">
                    Top doanh nghiệp
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Nhóm tenant nổi bật nhất theo metric backend đang theo dõi.
                  </p>
                </div>

                <div className="divide-y divide-slate-200/80">
                  {stats.topEnterprises.length > 0 ? (
                    stats.topEnterprises.map((item, index) => (
                      <div
                        key={item.enterpriseId}
                        className="flex items-center gap-4 px-6 py-5"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-sm font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/admin/enterprises/${item.enterpriseId}`}
                            className="truncate text-sm font-semibold text-[color:var(--admin-shell)] transition hover:text-indigo-700 hover:underline"
                          >
                            {item.enterpriseName}
                          </Link>
                          <p className="mt-1 text-sm text-slate-600">
                            {item.metric}
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-[color:var(--admin-shell)]">
                          {item.value.toLocaleString('vi-VN')}
                        </div>
                      </div>
                    ))
                  ) : (
                    <AdminEmptyState
                      icon={Building2}
                      title="Chưa có dữ liệu xếp hạng"
                      description="Danh sách top doanh nghiệp sẽ xuất hiện khi backend có metric để so sánh."
                      className="min-h-[240px] rounded-none border-0 shadow-none"
                    />
                  )}
                </div>
              </AdminPanel>
            </div>

            <div className="space-y-6">
              <AdminPanel className="overflow-hidden p-0">
                <div className="flex flex-col gap-3 border-b border-slate-200/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[color:var(--admin-shell)]">
                      Subscription mix
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Tỷ trọng các tier subscription đang được sử dụng.
                    </p>
                  </div>
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {stats.subscriptionMix.length.toLocaleString('vi-VN')} tier
                  </span>
                </div>

                {stats.subscriptionMix.length > 0 ? (
                  <div className="space-y-5 px-6 py-6">
                    {stats.subscriptionMix.map((item) => {
                      const width = Math.round(
                        (item.count / maxTierCount) * 100
                      )

                      return (
                        <div key={item.tierName} className="space-y-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-slate-700">
                              {item.tierName}
                            </span>
                            <span className="text-sm font-semibold text-[color:var(--admin-shell)]">
                              {item.count.toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-slate-100">
                            <div
                              className="h-3 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <AdminEmptyState
                    icon={BarChart3}
                    title="Chưa có dữ liệu subscription mix"
                    description="Thống kê tier đăng ký sẽ hiển thị khi backend trả về phân bố gói dịch vụ."
                    className="min-h-[260px] rounded-none border-0 shadow-none"
                  />
                )}
              </AdminPanel>

              <AdminPanel className="overflow-hidden border-amber-200/90 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,255,255,0.94))] p-0 shadow-[0_18px_40px_rgba(245,158,11,0.12)]">
                <div className="border-b border-amber-200/80 bg-amber-50/80 px-6 py-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-amber-950">
                          Renewal / Churn Watchlist
                        </h2>
                        <p className="mt-1 text-sm text-amber-900/80">
                          Các tenant có tín hiệu cần theo dõi sát về gia hạn
                          hoặc nguy cơ churn.
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-inset ring-amber-200">
                      {stats.churnWatchlist.length.toLocaleString('vi-VN')} cảnh báo
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-amber-100/80">
                  {stats.churnWatchlist.length > 0 ? (
                    stats.churnWatchlist.map((item) => (
                      <div
                        key={item.enterpriseId}
                        className="flex flex-col gap-4 px-6 py-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                              <Link
                                href={`/admin/enterprises/${item.enterpriseId}`}
                                className="text-sm font-semibold text-[color:var(--admin-shell)] transition hover:text-indigo-700 hover:underline"
                              >
                                {item.enterpriseName}
                              </Link>
                              <EnterpriseStatusBadge status={item.status} />
                            </div>
                            <p className="text-sm leading-6 text-slate-700">
                              {item.riskReason}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-amber-200 bg-white/90 px-4 py-3 text-sm text-slate-600">
                            Hết hạn{' '}
                            <span className="font-semibold text-amber-900">
                              {formatDate(item.subscriptionEndDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <AdminEmptyState
                      icon={AlertTriangle}
                      title="Watchlist đang trống"
                      description="Hiện chưa có doanh nghiệp nào nằm trong diện cần theo dõi gia hạn hoặc churn."
                      className="min-h-[260px] rounded-none border-0 bg-transparent shadow-none"
                    />
                  )}
                </div>
              </AdminPanel>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
