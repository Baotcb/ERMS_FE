export const PLAN_FEATURES = {
    free: [
        'Quản lý tuyển dụng cơ bản',
        'Đăng tin tuyển dụng (giới hạn 2)',
        'Khóa đào tạo nội bộ (giới hạn 2)',
        'Quản lý phòng ban & nhân viên',
        'Lịch phỏng vấn cơ bản',
    ],
    pro: [
        'Tất cả tính năng Free',
        'AI chấm điểm CV tự động',
        'Đăng tuyển mở rộng (20 tin)',
        'Khóa đào tạo mở rộng (25 khóa)',
        'AI gợi ý JD (sắp ra mắt)',
        'Hỗ trợ ưu tiên',
    ],
} as const

export const PLAN_BADGE_COLORS = {
    FREE: 'bg-slate-100 text-slate-700 border-slate-200',
    PRO: 'bg-blue-100 text-blue-700 border-blue-200',
} as const
