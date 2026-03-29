'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Briefcase,
  Building2,
  CreditCard,
  Globe,
  History,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  changeEnterpriseStatus,
  useEnterpriseAdminDetail,
} from '@/features/admin/api/admin-service'
import { AdminEmptyState } from '@/features/admin/components/admin-empty-state'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import { AdminPanel } from '@/features/admin/components/admin-panel'
import { EditStatusDrawer } from '@/features/admin/components/edit-status-drawer'
import { EnterpriseStatusBadge } from '@/features/admin/components/enterprise-status-badge'
import { ENTERPRISE_STATUS_LABELS } from '@/features/admin/constants'
import type {
  ChangeEnterpriseStatusRequest,
  EnterpriseStatus,
} from '@/features/admin/types'

const DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN')
const DATETIME_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
})
const CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function formatDate(value: string) {
  return DATE_FORMATTER.format(new Date(value))
}

function formatDateTime(value: string) {
  return DATETIME_FORMATTER.format(new Date(value))
}

function formatCurrency(value: number) {
  return CURRENCY_FORMATTER.format(value)
}

function getExpiryMeta(subscriptionEndDate: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expiryDate = new Date(subscriptionEndDate)
  expiryDate.setHours(0, 0, 0, 0)

  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysUntilExpiry < 0) {
    return {
      label: 'Đã hết hạn',
      detail: `${Math.abs(daysUntilExpiry)} ngày trước`,
      tone: 'text-rose-200',
    }
  }

  if (daysUntilExpiry === 0) {
    return {
      label: 'Hết hạn hôm nay',
      detail: formatDate(subscriptionEndDate),
      tone: 'text-amber-200',
    }
  }

  if (daysUntilExpiry <= 7) {
    return {
      label: `Còn ${daysUntilExpiry} ngày`,
      detail: 'Cần theo dõi gia hạn',
      tone: 'text-amber-200',
    }
  }

  return {
    label: `Còn ${daysUntilExpiry} ngày`,
    detail: formatDate(subscriptionEndDate),
    tone: 'text-teal-200',
  }
}

function getUsageMeta(count: number, limit?: number) {
  if (!limit) {
    return {
      helper: 'Đang vận hành',
      progress: null,
    }
  }

  const ratio = limit > 0 ? Math.min(100, Math.round((count / limit) * 100)) : 0

  return {
    helper: `${count.toLocaleString('vi-VN')} / ${limit.toLocaleString('vi-VN')}`,
    progress: ratio,
  }
}

function DetailField({
  label,
  value,
  icon: Icon,
  href,
  external = false,
  className,
}: {
  label: string
  value: string
  icon?: typeof Globe
  href?: string
  external?: boolean
  className?: string
}) {
  const content = href ? (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="break-all text-sm font-medium text-[color:var(--admin-shell)] transition hover:text-[color:var(--admin-accent)] hover:underline"
    >
      {value}
    </a>
  ) : (
    <p className="text-sm font-medium text-[color:var(--admin-shell)]">{value}</p>
  )

  return (
    <div className={cn('space-y-1.5', className)}>
      <dt className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
        {label}
      </dt>
      <dd>{content}</dd>
    </div>
  )
}

function UsageTile({
  icon: Icon,
  label,
  value,
  helper,
  progress,
}: {
  icon: typeof Building2
  label: string
  value: number
  helper: string
  progress: number | null
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_12px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl admin-accent-soft">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[color:var(--admin-shell)]">
              {label}
            </p>
            <p className="text-3xl font-semibold tracking-tight text-[color:var(--admin-shell)]">
              {value.toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        {progress !== null ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {progress}%
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-sm text-slate-500">{helper}</p>

      {progress !== null ? (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[color:var(--admin-accent)] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
    </div>
  )
}

function HistoryEmptyState() {
  return (
    <AdminEmptyState
      icon={History}
      title="Chưa có lịch sử thao tác"
      description="Các thay đổi trạng thái và ghi chú quản trị sẽ xuất hiện tại đây để hỗ trợ đối soát."
      className="min-h-[320px]"
    />
  )
}

function HistoryTimeline({
  items,
}: {
  items: Array<{
    id: string
    action: string
    previousStatus: EnterpriseStatus | null
    newStatus: EnterpriseStatus
    adminNote: string | null
    changedByName: string
    changedAt: string
  }>
}) {
  return (
    <AdminPanel className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[color:var(--admin-shell)]">
            Lịch sử thao tác admin
          </p>
          <p className="text-sm leading-6 text-slate-600">
            Theo dõi các lần thay đổi trạng thái để rà soát quyết định vận hành.
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <History className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-5">
        {items.map((history, index) => (
          <div key={history.id} className="relative pl-8">
            {index < items.length - 1 ? (
              <span className="absolute left-[11px] top-7 h-[calc(100%-12px)] w-px bg-slate-200" />
            ) : null}

            <span className="absolute left-0 top-2.5 h-[10px] w-[10px] rounded-full bg-[color:var(--admin-shell)] ring-4 ring-white" />

            <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span>
                  {history.previousStatus
                    ? ENTERPRISE_STATUS_LABELS[history.previousStatus]
                    : 'Khởi tạo'}
                </span>
                <span aria-hidden="true">→</span>
                <span className="text-[color:var(--admin-accent)]">
                  {ENTERPRISE_STATUS_LABELS[history.newStatus]}
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold text-[color:var(--admin-shell)]">
                {history.action}
              </p>

              {history.adminNote ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {history.adminNote}
                </p>
              ) : null}

              <p className="mt-3 text-xs text-slate-500">
                {history.changedByName} · {formatDateTime(history.changedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </AdminPanel>
  )
}

export function EnterpriseDetailPageContent({ id }: { id: string }) {
  const router = useRouter()
  const { data: enterprise, isLoading, error, mutate } =
    useEnterpriseAdminDetail(id)
  const [statusDrawerOpen, setStatusDrawerOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <AdminPageHeader
          title="Chi tiết doanh nghiệp"
          description="Đang tải hồ sơ tenant và trạng thái vận hành hiện tại."
        />
        <AdminPanel className="flex min-h-[360px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[color:var(--admin-accent)]" />
        </AdminPanel>
      </div>
    )
  }

  if (error || !enterprise) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <AdminPageHeader
          title="Chi tiết doanh nghiệp"
          description="Không thể tải hồ sơ doanh nghiệp ở lần yêu cầu này."
        />
        <AdminEmptyState
          icon={Building2}
          title="Không tìm thấy doanh nghiệp"
          description="Doanh nghiệp không tồn tại hoặc bạn không còn quyền truy cập vào hồ sơ này."
          action={
            <Link
              href="/admin/enterprises"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[color:var(--admin-shell)] px-4 text-sm font-semibold text-white transition hover:opacity-95"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Quay lại danh sách
            </Link>
          }
        />
      </div>
    )
  }

  const expiryMeta = getExpiryMeta(enterprise.subscriptionEndDate)
  const usageItems = [
    {
      label: 'Phòng ban',
      icon: Building2,
      value: enterprise.departmentCount,
      ...getUsageMeta(enterprise.departmentCount),
    },
    {
      label: 'Nhân viên',
      icon: Users,
      value: enterprise.employeeCount,
      ...getUsageMeta(enterprise.employeeCount, enterprise.currentPlan.maxUsers),
    },
    {
      label: 'Tin tuyển dụng',
      icon: Briefcase,
      value: enterprise.jobPostingCount,
      ...getUsageMeta(
        enterprise.jobPostingCount,
        enterprise.currentPlan.maxJobPostings
      ),
    },
    {
      label: 'Khóa đào tạo',
      icon: BookOpen,
      value: enterprise.courseCount,
      ...getUsageMeta(enterprise.courseCount, enterprise.currentPlan.maxCourses),
    },
  ]

  const handleStatusChange = async (payload: ChangeEnterpriseStatusRequest) => {
    await changeEnterpriseStatus(payload)
    setStatusDrawerOpen(false)
    await mutate()
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-8">
      <div className="space-y-4">
        <Link
          href="/admin/enterprises"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[color:var(--admin-accent)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Quay lại danh sách doanh nghiệp
        </Link>

        <AdminPageHeader
          title="Chi tiết doanh nghiệp"
          description="Theo dõi trạng thái tenant, chu kỳ subscription, mức sử dụng và lịch sử xử lý quản trị trên cùng một màn hình."
        />
      </div>

      <AdminPanel className="overflow-hidden p-0">
        <div className="grid gap-px bg-slate-200/70 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
          <div className="space-y-8 bg-white px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
              {enterprise.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={enterprise.logoUrl}
                  alt={enterprise.enterpriseName}
                  className="h-[4.5rem] w-[4.5rem] rounded-[22px] border border-slate-200 object-cover shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                />
              ) : (
                <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[22px] bg-[color:var(--admin-shell)] text-2xl font-semibold text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)]">
                  {enterprise.enterpriseName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {enterprise.enterpriseCode}
                  </span>
                  <EnterpriseStatusBadge status={enterprise.status} size="md" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--admin-shell)] sm:text-[2.15rem]">
                    {enterprise.enterpriseName}
                  </h2>
                  <p className="max-w-3xl text-sm leading-6 text-slate-600">
                    Hồ sơ tenant dành cho vận hành và đối soát: tập trung vào
                    subscription hiện tại, rủi ro cần xử lý và lịch sử quyết định
                    của admin.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 border-t border-slate-200/80 pt-6 sm:grid-cols-2 xl:grid-cols-3">
              <DetailField label="Email" value={enterprise.email || '—'} icon={Mail} />
              <DetailField label="Điện thoại" value={enterprise.phone || '—'} icon={Phone} />
              <DetailField
                label="Website"
                value={enterprise.website || '—'}
                icon={Globe}
                href={
                  enterprise.website
                    ? enterprise.website.startsWith('http')
                      ? enterprise.website
                      : `https://${enterprise.website}`
                    : undefined
                }
                external
              />
              <DetailField label="Mã số thuế" value={enterprise.taxCode || '—'} />
              <DetailField label="Người tạo" value={enterprise.createdByName || '—'} />
              <DetailField label="Ngày tạo" value={formatDate(enterprise.createdAt)} />
              <DetailField
                label="Địa chỉ"
                value={enterprise.address || '—'}
                className="sm:col-span-2 xl:col-span-3"
              />
            </div>
          </div>

          <div className="admin-shell flex flex-col justify-between gap-6 px-6 py-6 sm:px-8 sm:py-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Gói và hiệu lực
                </p>
                <div>
                  <p className="text-3xl font-semibold tracking-tight text-white">
                    {enterprise.currentPlan.planName}
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    {enterprise.subscriptionStatus || 'Không có trạng thái'} · Hết
                    hạn {formatDate(enterprise.subscriptionEndDate)}
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.08] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                      Nhịp gia hạn
                    </p>
                    <p className={cn('mt-2 text-xl font-semibold', expiryMeta.tone)}>
                      {expiryMeta.label}
                    </p>
                    <p className="mt-1 text-sm text-white/70">{expiryMeta.detail}</p>
                  </div>

                  <div className="rounded-2xl bg-white/10 px-3 py-2 text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                      Tổng chi tiêu
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {formatCurrency(enterprise.totalSpent)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-2xl bg-black/[0.12] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                      Bắt đầu hiệu lực
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {formatDate(enterprise.subscriptionStartDate)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-black/[0.12] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                      Thanh toán gần nhất
                    </p>
                    {enterprise.lastPayment ? (
                      <>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {formatCurrency(enterprise.lastPayment.amount)}
                        </p>
                        <p className="mt-1 text-xs text-white/60">
                          {enterprise.lastPayment.paymentMethod || 'Không có phương thức'} ·{' '}
                          {formatDate(enterprise.lastPayment.paidAt)}
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-white/70">
                        Chưa có thông tin thanh toán
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <button
                type="button"
                onClick={() => setStatusDrawerOpen(true)}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.08] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Đổi trạng thái
              </button>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/admin/payments?enterprise=${encodeURIComponent(enterprise.enterpriseName)}`
                  )
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[color:var(--admin-shell)] transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <CreditCard className="h-4 w-4" aria-hidden="true" />
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      </AdminPanel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <AdminPanel className="space-y-6">
          <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[color:var(--admin-shell)]">
                Billing và rủi ro
              </p>
              <p className="text-sm leading-6 text-slate-600">
                Ưu tiên kiểm tra tình trạng gói, khả năng chạm ngưỡng và các dấu
                hiệu cần xử lý thủ công.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
              Status tenant:{' '}
              <span className="font-semibold text-[color:var(--admin-shell)]">
                {ENTERPRISE_STATUS_LABELS[enterprise.status]}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Subscription
              </p>
              <p className="mt-2 text-base font-semibold text-[color:var(--admin-shell)]">
                {enterprise.subscriptionStatus || 'Chưa xác định'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Gói {enterprise.currentPlan.planCode || enterprise.currentPlan.planName}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Chu kỳ
              </p>
              <p className="mt-2 text-base font-semibold text-[color:var(--admin-shell)]">
                {formatDate(enterprise.subscriptionStartDate)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                đến {formatDate(enterprise.subscriptionEndDate)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Thanh toán gần nhất
              </p>
              {enterprise.lastPayment ? (
                <>
                  <p className="mt-2 text-base font-semibold text-[color:var(--admin-shell)]">
                    {formatCurrency(enterprise.lastPayment.amount)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(enterprise.lastPayment.paidAt)}
                  </p>
                  {enterprise.lastPayment.paymentReference ? (
                    <p className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      Ref: {enterprise.lastPayment.paymentReference}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="mt-2 text-base font-semibold text-[color:var(--admin-shell)]">
                    Chưa phát sinh
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Chưa có dữ liệu thanh toán
                  </p>
                </>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Tổng chi tiêu
              </p>
              <p className="mt-2 text-base font-semibold text-[color:var(--admin-shell)]">
                {formatCurrency(enterprise.totalSpent)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Tích lũy toàn bộ lifecycle
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[color:var(--admin-shell)]">
                  Hạn mức gói đang áp dụng
                </p>
                <p className="text-sm text-slate-600">
                  Dùng để đối chiếu nhanh khi xử lý gia hạn, nâng cấp hoặc khóa
                  tạm tenant.
                </p>
              </div>

              <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                {enterprise.currentPlan.planName}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  User seats
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--admin-shell)]">
                  {enterprise.currentPlan.maxUsers.toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Job postings
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--admin-shell)]">
                  {enterprise.currentPlan.maxJobPostings.toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Khóa đào tạo
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--admin-shell)]">
                  {enterprise.currentPlan.maxCourses.toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </div>

          <div
            className={cn(
              'rounded-[24px] border p-5',
              enterprise.riskFlags.length > 0
                ? 'border-amber-200 bg-amber-50'
                : 'border-emerald-200 bg-emerald-50'
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl',
                  enterprise.riskFlags.length > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                )}
              >
                {enterprise.riskFlags.length > 0 ? (
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    enterprise.riskFlags.length > 0
                      ? 'text-amber-900'
                      : 'text-emerald-900'
                  )}
                >
                  {enterprise.riskFlags.length > 0
                    ? 'Điểm cần theo dõi'
                    : 'Chưa ghi nhận cảnh báo'}
                </p>
                <p
                  className={cn(
                    'text-sm leading-6',
                    enterprise.riskFlags.length > 0
                      ? 'text-amber-900/80'
                      : 'text-emerald-900/80'
                  )}
                >
                  {enterprise.riskFlags.length > 0
                    ? 'Những điểm này nên được rà soát trước khi mở rộng hạn mức hoặc thay đổi trạng thái tenant.'
                    : 'Hồ sơ hiện tại chưa có cờ rủi ro từ backend. Tiếp tục theo dõi chu kỳ gói và mức sử dụng định kỳ.'}
                </p>

                {enterprise.riskFlags.length > 0 ? (
                  <ul className="space-y-2 pt-1 text-sm text-amber-950">
                    {enterprise.riskFlags.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span aria-hidden="true">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel variant="subtle" className="space-y-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[color:var(--admin-shell)]">
              Thông tin vận hành
            </p>
            <p className="text-sm leading-6 text-slate-600">
              Tóm tắt những dữ liệu hỗ trợ điều phối ticket, xác minh hồ sơ và
              liên hệ với tenant.
            </p>
          </div>

          <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
            <DetailField label="Email liên hệ" value={enterprise.email || '—'} icon={Mail} />
            <DetailField label="Điện thoại liên hệ" value={enterprise.phone || '—'} icon={Phone} />
            <DetailField
              label="Website chính"
              value={enterprise.website || '—'}
              icon={Globe}
              href={
                enterprise.website
                  ? enterprise.website.startsWith('http')
                    ? enterprise.website
                    : `https://${enterprise.website}`
                  : undefined
              }
              external
            />
            <DetailField label="Mã số thuế" value={enterprise.taxCode || '—'} />
            <DetailField label="Người tạo hồ sơ" value={enterprise.createdByName || '—'} />
            <DetailField label="Ngày tạo hồ sơ" value={formatDate(enterprise.createdAt)} />
            <DetailField
              label="Địa chỉ doanh nghiệp"
              value={enterprise.address || '—'}
              className="sm:col-span-2 xl:col-span-1"
            />
          </dl>
        </AdminPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <AdminPanel className="space-y-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[color:var(--admin-shell)]">
              Mức sử dụng
            </p>
            <p className="text-sm leading-6 text-slate-600">
              Các chỉ số này hỗ trợ đánh giá nhu cầu nâng cấp và khả năng chạm
              giới hạn của tenant.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {usageItems.map((item) => (
              <UsageTile key={item.label} {...item} />
            ))}
          </div>
        </AdminPanel>

        {enterprise.statusHistory.length > 0 ? (
          <HistoryTimeline items={enterprise.statusHistory} />
        ) : (
          <HistoryEmptyState />
        )}
      </div>

      <EditStatusDrawer
        open={statusDrawerOpen}
        onOpenChange={setStatusDrawerOpen}
        enterpriseId={enterprise.id}
        enterpriseName={enterprise.enterpriseName}
        currentStatus={enterprise.status}
        onConfirm={handleStatusChange}
      />
    </div>
  )
}
