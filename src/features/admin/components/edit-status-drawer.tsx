import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ENTERPRISE_STATUS_LABELS } from '@/features/admin/constants'
import type {
  ChangeEnterpriseStatusRequest,
  EnterpriseStatus,
} from '@/features/admin/types'
import { EnterpriseStatusBadge } from './enterprise-status-badge'

interface EditStatusDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enterpriseId: string
  enterpriseName: string
  currentStatus: EnterpriseStatus
  onConfirm?: (data: ChangeEnterpriseStatusRequest) => Promise<void>
}

const AVAILABLE_STATUSES: EnterpriseStatus[] = [
  'Active',
  'Suspended',
  'Locked',
  'Inactive',
]

export function EditStatusDrawer({
  open,
  onOpenChange,
  enterpriseId,
  enterpriseName,
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-full flex-col border-l border-gray-200 bg-white p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-gray-100 bg-gray-50/60 px-6 py-5">
          <SheetTitle className="text-xl font-bold text-gray-900">
            Đổi trạng thái
          </SheetTitle>
          <SheetDescription className="text-sm text-gray-500">
            {enterpriseName}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">
              Trạng thái hiện tại
            </p>
            <EnterpriseStatusBadge status={currentStatus} size="md" />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-900">
              Trạng thái mới
            </p>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_STATUSES.map((status) => {
                const isSelected = selectedStatus === status

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={
                      isSelected
                        ? 'rounded-xl border-2 border-indigo-500 bg-indigo-50 px-3 py-3 text-sm font-semibold text-indigo-700'
                        : 'rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }
                  >
                    {ENTERPRISE_STATUS_LABELS[status]}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="admin-note"
              className="text-sm font-semibold text-gray-900"
            >
              Ghi chú admin
            </label>
            <textarea
              id="admin-note"
              value={adminNote}
              onChange={(event) => setAdminNote(event.target.value)}
              rows={4}
              placeholder="Nhập ghi chú để lưu vào lịch sử quản trị..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <p className="text-xs text-gray-500">
              Thông tin này sẽ xuất hiện trong lịch sử thao tác admin của doanh
              nghiệp.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedStatus === currentStatus || isSubmitting}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Đang cập nhật...' : 'Xác nhận'}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
