'use client'

import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Building2,
  CreditCard,
  Search,
  Users,
} from 'lucide-react'
import { LoadingSpinner } from '@/components/common'
import { useAdminDashboard } from '@/features/admin/api/admin-service'
import { ADMIN_QUICK_LINKS } from '@/features/admin/constants'
import { AdminStatCard } from '@/features/admin/components/admin-stat-card'
import { EnterpriseStatusBadge } from '@/features/admin/components/enterprise-status-badge'

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
const CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function formatDateTime(value: string) {
  return DATETIME_FORMATTER.format(new Date(value))
}

function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount)
}

export default function AdminDashboardPageContent() {
  const { data, error, isLoading } = useAdminDashboard()
  const dashboard = data ?? EMPTY_DASHBOARD

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-gray-200 bg-white">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Trung tâm xử lý công việc hằng ngày của platform admin
          </p>
        </div>

        <Link
          href="/admin/enterprises"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Tìm doanh nghiệp
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Không thể tải đầy đủ dữ liệu dashboard. Trang đang hiển thị dữ liệu
          gần nhất hoặc rỗng.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Tổng doanh nghiệp"
          value={dashboard.totalEnterprises}
          icon={Building2}
          color="indigo"
          href="/admin/enterprises"
        />
        <AdminStatCard
          title="Đang hoạt động"
          value={dashboard.activeEnterprises}
          icon={Users}
          color="green"
          href="/admin/enterprises?status=Active"
        />
        <AdminStatCard
          title="Đã khóa"
          value={dashboard.lockedEnterprises}
          icon={AlertTriangle}
          color="red"
          href="/admin/enterprises?status=Locked"
        />
        <AdminStatCard
          title="Sắp hết hạn"
          value={dashboard.expiringSoonEnterprises}
          icon={CreditCard}
          color="amber"
          href="/admin/enterprises?expiringWithinDays=30"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Cần xử lý</h2>
            <Link
              href="/admin/enterprises"
              className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {dashboard.attentionItems.length > 0 ? (
              dashboard.attentionItems.map((item) => (
                <div
                  key={`${item.enterpriseId}-${item.attentionReason}`}
                  className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                      {item.enterpriseName}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {item.enterpriseCode} · {item.attentionReason}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <EnterpriseStatusBadge status={item.status} />
                    <span className="text-xs font-medium text-gray-500">
                      {new Date(item.subscriptionEndDate).toLocaleDateString(
                        'vi-VN'
                      )}
                    </span>
                    <Link
                      href={`/admin/enterprises/${item.enterpriseId}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Chi tiết
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center text-sm text-gray-500">
                Không có doanh nghiệp nào cần xử lý ngay.
              </div>
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Thao tác nhanh
              </h2>
            </div>
            <div className="p-3">
              {ADMIN_QUICK_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-indigo-700"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.description}
                    </p>
                  </div>
                  <item.icon
                    className="h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Hoạt động gần đây
              </h2>
            </div>
            <div className="space-y-4 p-5">
              {dashboard.recentActivities.length > 0 ? (
                dashboard.recentActivities.map((item) => (
                  <div
                    key={item.approvalHistoryId}
                    className="rounded-lg border border-gray-100 p-3"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {item.enterpriseName}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {item.action} · {item.previousStatus || 'N/A'} →{' '}
                      {item.newStatus}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {item.changedByName} · {formatDateTime(item.changedAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  Chưa có thao tác gần đây.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-400" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-gray-900">
                Thanh toán gần đây
              </h2>
            </div>
            <Link
              href="/admin/payments"
              className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="space-y-3 p-5">
            {dashboard.recentPayments.length > 0 ? (
              dashboard.recentPayments.map((item) => (
                <div
                  key={`${item.enterpriseId}-${item.createdAt}-${item.actionType}`}
                  className="rounded-lg border border-gray-100 bg-gray-50/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.enterpriseName}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {item.actionType} · {formatCurrency(item.amount)}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                    <Link
                      href={`/admin/enterprises/${item.enterpriseId}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Xem
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                Chưa có giao dịch gần đây.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
            <Bot className="h-5 w-5 text-gray-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-900">AI Services</h2>
          </div>

          <div className="space-y-4 p-5">
            <p className="text-sm text-gray-600">
              Theo dõi Gemini, usage CV scoring và cấu hình AI toàn hệ thống từ
              một nơi duy nhất.
            </p>
            <div className="rounded-xl border border-gray-100 bg-indigo-50 p-4">
              <p className="text-sm font-semibold text-indigo-900">
                Admin area chỉ giữ phần AI có dữ liệu thật
              </p>
              <p className="mt-1 text-sm text-indigo-700">
                Không còn page System Integrations giả lập; dữ liệu hiển thị lấy
                trực tiếp từ backend.
              </p>
            </div>
            <Link
              href="/admin/ai-services"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Mở AI Services
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
