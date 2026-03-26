'use client'

import {
  Activity,
  BarChart3,
  Bot,
  Building2,
  KeyRound,
  Loader2,
} from 'lucide-react'
import { useAiServiceOverview } from '@/features/admin/api/admin-service'

const DATETIME_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function formatDateTime(value: string | null) {
  return value
    ? DATETIME_FORMATTER.format(new Date(value))
    : 'Chưa có dữ liệu'
}

export function AiServicesPageContent() {
  const { data, isLoading, error } = useAiServiceOverview()

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-red-100 bg-white p-8 text-center text-red-600 shadow-sm">
        <p className="font-medium">Không thể tải dữ liệu AI Services.</p>
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

  const maxDailyVolume = Math.max(...data.dailyVolumes.map((item) => item.count), 1)
  const totalScores = Math.max(
    ...data.scoreDistribution.map((item) => item.count),
    1
  )

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">AI Services</h1>
        <p className="text-sm text-gray-500">
          Cấu hình Gemini và thống kê CV scoring thực tế toàn hệ thống
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Bot className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Provider
              </p>
              <p className="mt-1 text-xl font-black text-gray-900">
                {data.providerName}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <Activity className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                CV chấm hôm nay
              </p>
              <p className="mt-1 text-xl font-black text-gray-900">
                {data.scoredToday}
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
                CV chấm 7 ngày
              </p>
              <p className="mt-1 text-xl font-black text-gray-900">
                {data.scoredLast7Days}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <Building2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Enterprise dùng AI (30d)
              </p>
              <p className="mt-1 text-xl font-black text-gray-900">
                {data.distinctEnterprisesLast30Days}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">Cấu hình AI</h2>
          </div>
          <div className="space-y-5 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Model
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {data.modelName}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Trạng thái cấu hình
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {data.configurationStatus}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                API key
              </p>
              <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                {data.apiKeyConfigured ? 'Đã cấu hình' : 'Thiếu cấu hình'}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Phạm vi áp dụng
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {data.serviceMode}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Xử lý gần nhất
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {formatDateTime(data.lastProcessedAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Điểm trung bình 30 ngày
              </p>
              <p className="mt-1 text-2xl font-black text-indigo-700">
                {data.averageScoreLast30Days.toFixed(1)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">Khối lượng chấm CV</h2>
          </div>
          <div className="grid grid-cols-7 gap-3 p-6">
            {data.dailyVolumes.map((item) => {
              const height = Math.max(
                14,
                Math.round((item.count / maxDailyVolume) * 120)
              )

              return (
                <div key={item.date} className="flex flex-col items-center gap-3">
                  <div className="flex h-36 items-end">
                    <div
                      className="w-8 rounded-t-xl bg-indigo-500"
                      style={{ height }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-900">
                      {item.count}
                    </p>
                    <p className="text-[11px] text-gray-500">
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
        </section>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Phân bố điểm số</h2>
        </div>
        <div className="space-y-5 p-6">
          {data.scoreDistribution.map((item) => {
            const width = Math.round((item.count / totalScores) * 100)

            return (
              <div key={item.bucket} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700">
                    {item.bucket}
                  </span>
                  <span className="font-semibold text-gray-900">
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
  )
}
