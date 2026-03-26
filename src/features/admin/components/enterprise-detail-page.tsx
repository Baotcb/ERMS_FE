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
  Users,
} from 'lucide-react'
import {
  changeEnterpriseStatus,
  useEnterpriseAdminDetail,
} from '@/features/admin/api/admin-service'
import { EditStatusDrawer } from '@/features/admin/components/edit-status-drawer'
import { EnterpriseStatusBadge } from '@/features/admin/components/enterprise-status-badge'
import type { ChangeEnterpriseStatusRequest } from '@/features/admin/types'

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

export function EnterpriseDetailPageContent({ id }: { id: string }) {
  const router = useRouter()
  const { data: enterprise, isLoading, error, mutate } =
    useEnterpriseAdminDetail(id)
  const [statusDrawerOpen, setStatusDrawerOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error || !enterprise) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center">
        <Building2 className="mx-auto mb-4 h-14 w-14 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-900">
          Không tìm thấy doanh nghiệp
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Doanh nghiệp không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <Link
          href="/admin/enterprises"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Quay lại danh sách
        </Link>
      </div>
    )
  }

  const handleStatusChange = async (payload: ChangeEnterpriseStatusRequest) => {
    await changeEnterpriseStatus(payload)
    setStatusDrawerOpen(false)
    await mutate()
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div>
        <Link
          href="/admin/enterprises"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Quay lại danh sách
        </Link>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            {enterprise.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={enterprise.logoUrl}
                alt={enterprise.enterpriseName}
                className="h-16 w-16 rounded-2xl border border-gray-100 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-2xl font-bold text-indigo-700">
                {enterprise.enterpriseName.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {enterprise.enterpriseName}
                </h1>
                <EnterpriseStatusBadge status={enterprise.status} size="md" />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Mã{' '}
                <span className="font-semibold text-gray-700">
                  {enterprise.enterpriseCode}
                </span>{' '}
                · Gói{' '}
                <span className="font-semibold text-gray-700">
                  {enterprise.currentPlan.planName}
                </span>{' '}
                · Hết hạn{' '}
                <span className="font-semibold text-gray-700">
                  {formatDate(enterprise.subscriptionEndDate)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setStatusDrawerOpen(true)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
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
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              Thanh toán
            </button>
          </div>
        </div>
      </section>

      {enterprise.riskFlags.length > 0 ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            <h2 className="text-lg font-bold">Cảnh báo rủi ro</h2>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-amber-900">
            {enterprise.riskFlags.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">Thông tin cơ bản</h2>
          </div>
          <dl className="grid gap-5 p-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Mã số thuế
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                {enterprise.taxCode || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Ngày tạo
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                {formatDate(enterprise.createdAt)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Địa chỉ
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                {enterprise.address || '—'}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                Website
              </dt>
              <dd className="mt-1 text-sm font-medium text-indigo-600">
                {enterprise.website ? (
                  <a
                    href={
                      enterprise.website.startsWith('http')
                        ? enterprise.website
                        : `https://${enterprise.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {enterprise.website}
                  </a>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                Điện thoại
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                {enterprise.phone || '—'}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                Email
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                {enterprise.email || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Người tạo
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                {enterprise.createdByName || '—'}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">
              Subscription & Billing
            </h2>
          </div>
          <div className="space-y-6 p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Gói hiện tại
                </p>
                <p className="mt-1 text-lg font-bold text-indigo-700">
                  {enterprise.currentPlan.planName}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Trạng thái subscription
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {enterprise.subscriptionStatus || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Giới hạn users
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {enterprise.currentPlan.maxUsers.toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Giới hạn job postings
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {enterprise.currentPlan.maxJobPostings.toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            <div className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="font-medium text-gray-500">Bắt đầu hiệu lực</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {formatDate(enterprise.subscriptionStartDate)}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Kết thúc hiệu lực</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {formatDate(enterprise.subscriptionEndDate)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Thanh toán gần nhất
              </p>
              {enterprise.lastPayment ? (
                <div className="mt-3 flex flex-col gap-1 text-sm text-gray-700">
                  <span className="font-bold text-gray-900">
                    {formatCurrency(enterprise.lastPayment.amount)}
                  </span>
                  <span>
                    {enterprise.lastPayment.paymentMethod ||
                      'Không có phương thức'}
                  </span>
                  <span>{formatDate(enterprise.lastPayment.paidAt)}</span>
                  {enterprise.lastPayment.paymentReference ? (
                    <span className="text-xs text-gray-500">
                      Ref: {enterprise.lastPayment.paymentReference}
                    </span>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-500">
                  Chưa có thông tin thanh toán
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Tổng chi tiêu
              </span>
              <span className="text-xl font-black text-indigo-700">
                {formatCurrency(enterprise.totalSpent)}
              </span>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">Mức độ sử dụng</h2>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center">
              <Building2 className="mx-auto h-6 w-6 text-indigo-500" aria-hidden="true" />
              <p className="mt-3 text-2xl font-black text-gray-900">
                {enterprise.departmentCount}
              </p>
              <p className="text-xs font-medium text-gray-500">Phòng ban</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center">
              <Users className="mx-auto h-6 w-6 text-indigo-500" aria-hidden="true" />
              <p className="mt-3 text-2xl font-black text-gray-900">
                {enterprise.employeeCount}
              </p>
              <p className="text-xs font-medium text-gray-500">Nhân viên</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center">
              <Briefcase className="mx-auto h-6 w-6 text-indigo-500" aria-hidden="true" />
              <p className="mt-3 text-2xl font-black text-gray-900">
                {enterprise.jobPostingCount}
              </p>
              <p className="text-xs font-medium text-gray-500">Job postings</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center">
              <BookOpen className="mx-auto h-6 w-6 text-indigo-500" aria-hidden="true" />
              <p className="mt-3 text-2xl font-black text-gray-900">
                {enterprise.courseCount}
              </p>
              <p className="text-xs font-medium text-gray-500">Khóa đào tạo</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
            <History className="h-5 w-5 text-gray-400" aria-hidden="true" />
            <h2 className="text-lg font-bold text-gray-900">
              Lịch sử thao tác admin
            </h2>
          </div>
          <div className="space-y-4 p-6">
            {enterprise.statusHistory.length > 0 ? (
              enterprise.statusHistory.map((history) => (
                <div
                  key={history.id}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
                    <span>{history.previousStatus || 'N/A'}</span>
                    <span>→</span>
                    <span className="text-indigo-700">{history.newStatus}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {history.action}
                  </p>
                  {history.adminNote ? (
                    <p className="mt-1 text-sm text-gray-600">
                      {history.adminNote}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs text-gray-500">
                    {history.changedByName} · {formatDateTime(history.changedAt)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                Chưa có lịch sử thao tác admin.
              </p>
            )}
          </div>
        </section>
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
