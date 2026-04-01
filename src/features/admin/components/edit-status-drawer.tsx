import { useEffect, useState } from 'react'
import {
  Check,
  CircleOff,
  Lock,
  PauseCircle,
  PlayCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ENTERPRISE_STATUS_LABELS } from '@/features/admin/constants'
import type {
  ChangeEnterpriseStatusRequest,
  EnterpriseStatus,
} from '@/features/admin/types'

interface EditStatusDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enterpriseId: string
  enterpriseName: string
  logoUrl?: string | null
  currentStatus: EnterpriseStatus
  onConfirm?: (data: ChangeEnterpriseStatusRequest) => Promise<void>
}

const AVAILABLE_STATUSES: EnterpriseStatus[] = [
  'Active',
  'Suspended',
  'Locked',
  'Inactive',
]

const STATUS_OPTION_META: Record<
  EnterpriseStatus,
  {
    description: string
    icon: typeof PlayCircle
    selectedClassName: string
    iconClassName: string
  }
> = {
  Active: {
    description: 'Cho phép tenant vận hành và sử dụng subscription bình thường.',
    icon: PlayCircle,
    selectedClassName:
      'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-[0_12px_28px_rgba(5,150,105,0.16)]',
    iconClassName: 'text-emerald-600',
  },
  Suspended: {
    description: 'Tạm dừng truy cập trong khi chờ xử lý billing hoặc hỗ trợ.',
    icon: PauseCircle,
    selectedClassName:
      'border-amber-500 bg-amber-50 text-amber-950 shadow-[0_12px_28px_rgba(217,119,6,0.14)]',
    iconClassName: 'text-amber-600',
  },
  Locked: {
    description: 'Khóa tenant khi cần chặn truy cập ngay để kiểm soát rủi ro.',
    icon: Lock,
    selectedClassName:
      'border-rose-500 bg-rose-50 text-rose-950 shadow-[0_12px_28px_rgba(225,29,72,0.14)]',
    iconClassName: 'text-rose-600',
  },
  Inactive: {
    description: 'Đưa tenant về trạng thái ngừng hoạt động nhưng vẫn lưu lịch sử.',
    icon: CircleOff,
    selectedClassName:
      'border-slate-500 bg-slate-100 text-slate-950 shadow-[0_12px_28px_rgba(51,65,85,0.12)]',
    iconClassName: 'text-slate-600',
  },
}

export function EditStatusDrawer({
  open,
  onOpenChange,
  enterpriseId,
  enterpriseName,
  logoUrl,
  currentStatus,
  onConfirm,
}: EditStatusDrawerProps) {
  const [selectedStatus, setSelectedStatus] =
    useState<EnterpriseStatus>(currentStatus)
  const [adminNote, setAdminNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedStatus(currentStatus)
      setAdminNote('')
      setIsSubmitting(false)
    }
  }, [currentStatus, open])

  const handleConfirm = async () => {
    if (!onConfirm || selectedStatus === currentStatus || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      await onConfirm({
        enterpriseId,
        newStatus: selectedStatus,
        adminNote,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectionChanged = selectedStatus !== currentStatus

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="center"
        className="admin-theme flex h-full w-full flex-col bg-slate-50/80 p-0 sm:w-[min(calc(100vw-3rem),42rem)]"
      >
        <SheetHeader className="gap-2 border-b border-slate-200 bg-white px-5 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6">
          <SheetTitle className="pr-10 text-lg font-semibold text-[color:var(--admin-shell)]">
            Đổi trạng thái
          </SheetTitle>

          <div className="flex items-center gap-3 pr-10">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={`${enterpriseName} logo`}
                className="h-11 w-11 rounded-2xl border border-slate-200/80 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
                {enterpriseName.charAt(0).toUpperCase() || '?'}
              </div>
            )}

            <div className="min-w-0 space-y-1">
              <SheetDescription className="truncate text-sm font-medium text-slate-600">
                {enterpriseName}
              </SheetDescription>
              <p className="text-xs text-slate-500">
                Kiểm tra đúng tenant trước khi áp dụng thay đổi trạng thái.
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="space-y-6">
            <fieldset className="space-y-3">
              <legend className="space-y-1">
                <span className="block text-sm font-semibold text-[color:var(--admin-shell)]">
                  Chọn trạng thái mới
                </span>
                <span className="block text-sm font-normal text-slate-500">
                  Các lựa chọn bên dưới tác động trực tiếp đến khả năng truy cập của tenant.
                </span>
              </legend>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {AVAILABLE_STATUSES.map((status) => {
                  const isSelected = selectedStatus === status
                  const meta = STATUS_OPTION_META[status]
                  const Icon = meta.icon

                  return (
                    <label
                      key={status}
                      className={cn(
                        'group block cursor-pointer',
                        isSubmitting ? 'cursor-not-allowed opacity-60' : ''
                      )}
                    >
                      <input
                        type="radio"
                        name="enterprise-status"
                        value={status}
                        checked={isSelected}
                        onChange={() => setSelectedStatus(status)}
                        disabled={isSubmitting}
                        className="peer sr-only"
                      />

                      <div
                        className={cn(
                          'rounded-[22px] border px-4 py-4 text-left transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-teal-500/30 sm:px-5 sm:py-5',
                          isSelected
                            ? meta.selectedClassName
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_10px_24px_rgba(15,23,42,0.05)]'
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-3">
                            <div
                              className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 transition-colors',
                                isSelected ? 'bg-white/70' : 'group-hover:bg-slate-200/80'
                              )}
                            >
                              <Icon
                                className={cn(
                                  'h-5 w-5',
                                  isSelected ? 'text-current' : meta.iconClassName
                                )}
                                aria-hidden="true"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <p className="text-sm font-semibold">
                                {ENTERPRISE_STATUS_LABELS[status]}
                              </p>
                              <p
                                className={cn(
                                  'text-xs leading-5',
                                  isSelected ? 'text-current opacity-80' : 'text-slate-500'
                                )}
                              >
                                {meta.description}
                              </p>
                            </div>
                          </div>

                          <span
                            className={cn(
                              'mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs transition-colors',
                              isSelected
                                ? 'border-current bg-white/80 text-current'
                                : 'border-slate-200 bg-white text-transparent'
                            )}
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <section className="space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-note"
                  className="text-sm font-semibold text-[color:var(--admin-shell)]"
                >
                  Ghi chú admin
                </label>
                <p className="text-sm text-slate-500">
                  Ghi ngắn gọn lý do thay đổi để lưu lại trong lịch sử thao tác.
                </p>
              </div>

              <textarea
                id="admin-note"
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                rows={5}
                placeholder="Ví dụ: chờ đối soát thanh toán tháng này trước khi mở lại tenant."
                className="min-h-[148px] w-full resize-none rounded-[22px] border border-slate-200 bg-white px-4 py-3.5 text-sm text-[color:var(--admin-shell)] outline-none transition-colors placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10"
              />

              <p className="text-xs text-slate-500">
                Ghi chú không bắt buộc nhưng nên có khi trạng thái thay đổi do
                billing, khóa tạm hoặc yêu cầu hỗ trợ.
              </p>
            </section>
          </div>
        </div>

        <SheetFooter className="border-t border-slate-200 bg-white/95 px-5 py-4 shadow-[0_-10px_30px_rgba(15,23,42,0.06)] backdrop-blur sm:flex-row sm:items-center sm:justify-end sm:px-7 sm:py-5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectionChanged || isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--admin-shell)] px-4 text-sm font-semibold text-white transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {isSubmitting ? 'Đang cập nhật...' : 'Xác nhận thay đổi'}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
