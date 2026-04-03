'use client'

import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Building2,
  CreditCard,
  RefreshCw,
  Users,
} from 'lucide-react'
import { LoadingSpinner } from '@/components/common'
import {
  revalidateAdminDashboard,
  useAdminDashboard,
} from '@/features/admin/api/admin-service'
import { AdminEmptyState } from '@/features/admin/components/admin-empty-state'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import { AdminPanel } from '@/features/admin/components/admin-panel'
import { AdminStatCard } from '@/features/admin/components/admin-stat-card'
import { EnterpriseStatusBadge } from '@/features/admin/components/enterprise-status-badge'
import { ADMIN_QUICK_LINKS } from '@/features/admin/constants'

const EMPTY_DASHBOARD = {
  totalEnterprises: 0,
  activeEnterprises: 0,
  lockedEnterprises: 0,
  expiringSoonEnterprises: 0,
  attentionItems: [],
  recentActivities: [],
  recentPayments: [],
}

const DATETIME_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
})
const DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
})
const CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const HEADER_ACTION_CLASSNAME =
  'inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 focus-visible:ring-offset-2'

const QUICK_LINK_STYLES = {
  indigo: {
    icon: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
    hover: 'hover:border-indigo-200 hover:bg-indigo-50/70',
  },
  green: {
    icon: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    hover: 'hover:border-emerald-200 hover:bg-emerald-50/70',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600 ring-amber-100',
    hover: 'hover:border-amber-200 hover:bg-amber-50/70',
  },
  red: {
    icon: 'bg-rose-50 text-rose-600 ring-rose-100',
    hover: 'hover:border-rose-200 hover:bg-rose-50/70',
  },
  gray: {
    icon: 'bg-slate-100 text-slate-600 ring-slate-200',
    hover: 'hover:border-slate-300 hover:bg-slate-50/90',
  },
} as const

function formatDate(value: string) {
  return DATE_FORMATTER.format(new Date(value))
}

function formatDateTime(value: string) {
  return DATETIME_FORMATTER.format(new Date(value))
}

function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount)
}

export default function AdminDashboardPageContent() {
  const { data, error, isLoading } = useAdminDashboard()
  const dashboard = data ?? EMPTY_DASHBOARD

  const handleRefresh = () => {
    void revalidateAdminDashboard()
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <AdminPageHeader
        title="Admin Dashboard"
        description="Trung tâm xử lý hằng ngày cho admin, ưu tiên các việc cần xử lý ngay trước khi đi vào chỉ số và hỗ trợ vận hành."
        actions={
          <button
            type="button"
            onClick={handleRefresh}
            className={HEADER_ACTION_CLASSNAME}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Làm mới dữ liệu
          </button>
        }
      />

      {isLoading && !data ? (
        <AdminPanel className="flex min-h-[320px] items-center justify-center">
          <LoadingSpinner size="lg" className="text-teal-600" />
        </AdminPanel>
      ) : (
        <>
          {error ? (
            <AdminPanel
              variant="subtle"
              className="border-amber-200/80 bg-amber-50/70 text-amber-900"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">
                    Không thể tải đầy đủ dữ liệu dashboard.
                  </p>
                  <p className="text-sm leading-6 text-amber-800/90">
                    Trang đang hiển thị dữ liệu gần nhất hoặc giá trị rỗng để
                    bạn vẫn tiếp tục theo dõi vận hành.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-200 bg-white px-4 text-sm font-medium text-amber-900 transition hover:bg-amber-50"
                >
                  Thử lại
                </button>
              </div>
            </AdminPanel>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px] xl:items-start">
            <div className="space-y-6">
              <AdminPanel className="overflow-hidden p-0">
                <div className="flex flex-col gap-3 border-b border-slate-200/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-[color:var(--admin-shell)]">
                          Cần xử lý
                        </h2>
                        <p className="text-sm text-slate-600">
                          Danh sách tenant đang cần admin kiểm tra hoặc can thiệp.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-100">
                      {dashboard.attentionItems.length.toLocaleString('vi-VN')} mục
                    </span>
                    <Link
                      href="/admin/enterprises"
                      className="text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
                    >
                      Xem tất cả
                    </Link>
                  </div>
                </div>

                <div className="divide-y divide-slate-200/80">
                  {dashboard.attentionItems.length > 0 ? (
                    dashboard.attentionItems.map((item) => (
                      <div
                        key={item.enterpriseId}
                        className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-base font-semibold text-[color:var(--admin-shell)]">
                              {item.enterpriseName}
                            </p>
                            <EnterpriseStatusBadge status={item.status} />
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-600">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-medium text-slate-600">
                              {item.enterpriseCode}
                            </span>
                            <span>Hết hạn {formatDate(item.subscriptionEndDate)}</span>
                          </div>
                        </div>

                        <Link
                          href={`/admin/enterprises/${item.enterpriseId}`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
                        >
                          Chi tiết
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>
                    ))
                  ) : (
                    <AdminEmptyState
                      icon={AlertTriangle}
                      title="Không có mục cần xử lý ngay"
                      description="Các tenant hiện chưa phát sinh cảnh báo cần admin can thiệp."
                      className="min-h-[220px] rounded-none border-0 shadow-none"
                    />
                  )}
                </div>
              </AdminPanel>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <AdminStatCard
                  title="Tổng doanh nghiệp"
                  value={dashboard.totalEnterprises.toLocaleString('vi-VN')}
                  icon={Building2}
                  color="indigo"
                  href="/admin/enterprises"
                />
                <AdminStatCard
                  title="Đang hoạt động"
                  value={dashboard.activeEnterprises.toLocaleString('vi-VN')}
                  icon={Users}
                  color="green"
                  href="/admin/enterprises?status=Active"
                />
                <AdminStatCard
                  title="Đã khóa"
                  value={dashboard.lockedEnterprises.toLocaleString('vi-VN')}
                  icon={AlertTriangle}
                  color="red"
                  href="/admin/enterprises?status=Locked"
                />
                <AdminStatCard
                  title="Sắp hết hạn"
                  value={dashboard.expiringSoonEnterprises.toLocaleString('vi-VN')}
                  icon={CreditCard}
                  color="amber"
                  href="/admin/enterprises?expiringWithinDays=30"
                />
              </div>

              <div>
                <AdminPanel className="overflow-hidden p-0">
                  <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <CreditCard className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-[color:var(--admin-shell)]">
                          Thanh toán gần đây
                        </h2>
                        <p className="text-sm text-slate-600">
                          Dòng thanh toán mới nhất để đối soát nhanh.
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/admin/payments"
                      className="text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
                    >
                      Xem tất cả
                    </Link>
                  </div>

                  <div className="divide-y divide-slate-200/80">
                    {dashboard.recentPayments.length > 0 ? (
                      dashboard.recentPayments.map((item) => (
                        <div
                          key={`${item.enterpriseId}-${item.createdAt}-${item.actionType}`}
                          className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="space-y-1.5">
                            <p className="font-semibold text-[color:var(--admin-shell)]">
                              {item.enterpriseName}
                            </p>
                            <p className="text-sm text-slate-600">
                              {item.actionType} • {formatCurrency(item.amount)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDateTime(item.createdAt)}
                            </p>
                          </div>

                          <Link
                            href={`/admin/enterprises/${item.enterpriseId}`}
                            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
                          >
                            Xem doanh nghiệp
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        </div>
                      ))
                    ) : (
                      <AdminEmptyState
                        icon={CreditCard}
                        title="Chưa có giao dịch gần đây"
                        description="Dữ liệu thanh toán mới sẽ xuất hiện tại đây để admin đối soát nhanh."
                        className="min-h-[220px] rounded-none border-0 shadow-none"
                      />
                    )}
                  </div>
                </AdminPanel>

              </div>
            </div>

            <div className="space-y-6">
              <AdminPanel className="overflow-hidden p-0">
                <div className="border-b border-slate-200/80 px-6 py-5">
                  <h2 className="text-lg font-semibold text-[color:var(--admin-shell)]">
                    Thao tác nhanh
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Điều hướng trực tiếp tới các khu vực vận hành chính.
                  </p>
                </div>

                <div className="grid gap-3 p-4">
                  {ADMIN_QUICK_LINKS.map((item) => {
                    const styles = QUICK_LINK_STYLES[item.tone]

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white/70 p-4 transition ${styles.hover}`}
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset ${styles.icon}`}
                        >
                          <item.icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[color:var(--admin-shell)]">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {item.description}
                          </p>
                        </div>
                        <ArrowRight
                          className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-slate-600"
                          aria-hidden="true"
                        />
                      </Link>
                    )
                  })}
                </div>
              </AdminPanel>

              <AdminPanel className="overflow-hidden p-0">
                <div className="border-b border-slate-200/80 px-6 py-5">
                  <h2 className="text-lg font-semibold text-[color:var(--admin-shell)]">
                    Hoạt động gần đây
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Theo dõi các thay đổi trạng thái mới nhất trên nền tảng.
                  </p>
                </div>

                <div className="divide-y divide-slate-200/80">
                  {dashboard.recentActivities.length > 0 ? (
                    dashboard.recentActivities.map((item) => (
                      <div key={item.approvalHistoryId} className="px-6 py-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-[color:var(--admin-shell)]">
                            {item.enterpriseName}
                          </p>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                            {item.action}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {item.previousStatus || 'N/A'} → {item.newStatus}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {item.changedByName} • {formatDateTime(item.changedAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <AdminEmptyState
                      icon={Bot}
                      title="Chưa có hoạt động gần đây"
                      description="Lịch sử thay đổi trạng thái sẽ xuất hiện tại đây khi admin thao tác."
                      className="min-h-[220px] rounded-none border-0 shadow-none"
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
