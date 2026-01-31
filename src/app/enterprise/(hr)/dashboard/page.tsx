import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { HRDashboard, getDashboardStats } from '@/features/hr'
import { ComingSoonPage } from '@/components/shared/coming-soon-page'

export const metadata: Metadata = {
    title: 'Dashboard - Enterprise Portal',
    description: 'Tổng quan doanh nghiệp',
}

export default async function EnterpriseDashboardPage() {
    const cookieStore = await cookies()
    const userRole = cookieStore.get('user_role')?.value || ''

    // HR Manager gets full dashboard
    if (userRole === 'HRManager') {
        const stats = await getDashboardStats()
        return <HRDashboard stats={stats} />
    }

    // Other roles get coming soon message with role-specific info
    const roleMessages: Record<string, { title: string; description: string }> = {
        'Employee': {
            title: 'Cổng Nhân viên đang được phát triển',
            description: 'Bạn sẽ sớm có thể xem lịch làm việc, đơn từ, và các thông tin cá nhân tại đây.'
        },
        'Trainer': {
            title: 'Cổng Giảng viên đang được phát triển',
            description: 'Bạn sẽ sớm có thể quản lý khóa học, lịch giảng dạy, và học viên tại đây.'
        },
        'Director': {
            title: 'Cổng Giám đốc đang được phát triển',
            description: 'Bạn sẽ sớm có thể xem báo cáo tổng hợp, phê duyệt, và các chức năng quản lý cấp cao tại đây.'
        },
        'DepartmentHead': {
            title: 'Cổng Trưởng phòng đang được phát triển',
            description: 'Bạn sẽ sớm có thể quản lý nhân sự phòng ban, phê duyệt đơn từ, và xem báo cáo phòng ban tại đây.'
        }
    }

    const message = roleMessages[userRole] || {
        title: 'Hệ thống đang được phát triển',
        description: 'Tính năng dành cho vai trò của bạn đang được xây dựng. Vui lòng quay lại sau!'
    }

    return <ComingSoonPage title={message.title} description={message.description} />
}
