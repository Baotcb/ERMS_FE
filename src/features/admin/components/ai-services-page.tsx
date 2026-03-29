'use client'

import {
  Activity,
  BarChart3,
  Bot,
  Building2,
  KeyRound,
  RefreshCw,
} from 'lucide-react'
import { LoadingSpinner } from '@/components/common'
import {
  revalidateAiServiceOverview,
  useAiServiceOverview,
} from '@/features/admin/api/admin-service'
import { AdminEmptyState } from '@/features/admin/components/admin-empty-state'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import { AdminPanel } from '@/features/admin/components/admin-panel'
import { AdminStatCard } from '@/features/admin/components/admin-stat-card'

const DATETIME_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const HEADER_ACTION_CLASSNAME =
  'inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 focus-visible:ring-offset-2'

function formatDateTime(value: string | null) {
  return value
    ? DATETIME_FORMATTER.format(new Date(value))
    : 'Chưa có dữ liệu'
}

export function AiServicesPageContent() {
  const { data, isLoading, error } = useAiServiceOverview()

  const handleRefresh = () => {
    void revalidateAiServiceOverview()
  }

  const maxDailyVolume =
    data && data.dailyVolumes.length > 0
      ? Math.max(...data.dailyVolumes.map((item) => item.count), 1)
      : 1
  const totalScores =
    data && data.scoreDistribution.length > 0
      ? Math.max(
          data.scoreDistribution.reduce((sum, item) => sum + item.count, 0),
          1
        )
      : 1

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <AdminPageHeader
        title="AI Services"
        description="Bảng điều phối cho Gemini configuration, khối lượng CV scoring và chất lượng dữ liệu AI trên toàn hệ thống."
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
      ) : error || !data ? (
        <AdminEmptyState
          icon={Bot}
          title="Không thể tải dữ liệu AI Services"
          description="Trang chưa lấy được overview từ backend. Bạn có thể thử tải lại để đồng bộ lại cấu hình và số liệu scoring."
          action={
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--admin-shell)] px-4 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Thử lại
            </button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              title="Provider"
              value={data.providerName || 'N/A'}
              icon={Bot}
              color="indigo"
            />
            <AdminStatCard
              title="CV chấm hôm nay"
              value={data.scoredToday.toLocaleString('vi-VN')}
              icon={Activity}
              color="green"
            />
            <AdminStatCard
              title="CV chấm 7 ngày"
              value={data.scoredLast7Days.toLocaleString('vi-VN')}
              icon={BarChart3}
              color="blue"
            />
            <AdminStatCard
              title="Enterprise dùng AI (30d)"
              value={data.distinctEnterprisesLast30Days.toLocaleString('vi-VN')}
              icon={Building2}
              color="amber"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.95fr)_minmax(0,1.05fr)]">
            <AdminPanel className="overflow-hidden p-0">
              <div className="border-b border-slate-200/80 px-6 py-5">
                <h2 className="text-lg font-semibold text-[color:var(--admin-shell)]">
                  Cấu hình AI
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Trạng thái provider, model, API key và dữ liệu xử lý gần nhất.
                </p>
              </div>

              <div className="space-y-5 px-6 py-6">
                <div className="rounded-2xl bg-indigo-50/80 p-4 ring-1 ring-inset ring-indigo-100">
                  <p className="text-sm font-semibold text-indigo-900">
                    Dữ liệu AI Services được lấy trực tiếp từ backend admin.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-indigo-700">
                    Cấu hình Gemini và thống kê scoring đang được gom về cùng
                    một surface để admin kiểm tra nhanh hơn.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Model
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[color:var(--admin-shell)]">
                      {data.modelName}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Trạng thái cấu hình
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[color:var(--admin-shell)]">
                      {data.configurationStatus}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      API key
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                      {data.apiKeyConfigured ? 'Đã cấu hình' : 'Thiếu cấu hình'}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Phạm vi áp dụng
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[color:var(--admin-shell)]">
                      {data.serviceMode}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Xử lý gần nhất
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[color:var(--admin-shell)]">
                      {formatDateTime(data.lastProcessedAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">
                      Điểm trung bình 30 ngày
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-indigo-900">
                      {data.averageScoreLast30Days.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            </AdminPanel>

            <AdminPanel className="overflow-hidden p-0">
              <div className="border-b border-slate-200/80 px-6 py-5">
                <h2 className="text-lg font-semibold text-[color:var(--admin-shell)]">
                  Khối lượng chấm CV
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Sản lượng scoring theo ngày trong 7 ngày gần nhất.
                </p>
              </div>

              {data.dailyVolumes.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 px-6 py-6 sm:grid-cols-4 xl:grid-cols-7">
                  {data.dailyVolumes.map((item) => {
                    const height = Math.max(
                      20,
                      Math.round((item.count / maxDailyVolume) * 144)
                    )

                    return (
                      <div
                        key={item.date}
                        className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-4"
                      >
                        <div className="flex h-40 items-end">
                          <div
                            className="w-10 rounded-t-2xl bg-gradient-to-t from-indigo-600 to-teal-500"
                            style={{ height }}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-[color:var(--admin-shell)]">
                            {item.count.toLocaleString('vi-VN')}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(item.date).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <AdminEmptyState
                  icon={BarChart3}
                  title="Chưa có dữ liệu khối lượng"
                  description="Khi backend ghi nhận các lượt scoring, biểu đồ 7 ngày sẽ xuất hiện tại đây."
                  className="min-h-[280px] rounded-none border-0 shadow-none"
                />
              )}
            </AdminPanel>
          </div>

          <AdminPanel className="overflow-hidden p-0">
            <div className="border-b border-slate-200/80 px-6 py-5">
              <h2 className="text-lg font-semibold text-[color:var(--admin-shell)]">
                Phân bố điểm số
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Tỷ lệ bucket điểm CV để theo dõi chất lượng scoring tổng thể.
              </p>
            </div>

            {data.scoreDistribution.length > 0 ? (
              <div className="space-y-4 px-6 py-6">
                {data.scoreDistribution.map((item) => {
                  const width = Math.round((item.count / totalScores) * 100)

                  return (
                    <div key={item.bucket} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-700">
                          {item.bucket}
                        </span>
                        <span className="font-semibold text-[color:var(--admin-shell)]">
                          {item.count.toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <AdminEmptyState
                icon={Activity}
                title="Chưa có dữ liệu phân bố điểm"
                description="Biểu đồ bucket điểm sẽ được hiển thị khi hệ thống có đủ kết quả scoring."
                className="min-h-[260px] rounded-none border-0 shadow-none"
              />
            )}
          </AdminPanel>
        </>
      )}
    </div>
  )
}
