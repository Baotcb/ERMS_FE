'use client'

import { FileText } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function ApplicationList() {
    // ⚠️ Backend chưa có API get-my-applications nên tạm thời hiển thị placeholder
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-slate-50">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
                <FileText className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-2">Tính năng đang phát triển</h3>
            <p className="text-slate-500 max-w-md mb-6">
                Chức năng xem danh sách đơn ứng tuyển đang được xây dựng và sẽ sớm ra mắt.
                Vui lòng quay lại sau.
            </p>
            <Button asChild variant="outline">
                <Link href="/jobs">Tìm việc làm mới</Link>
            </Button>
        </div>
    )
}

