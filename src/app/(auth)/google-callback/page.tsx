'use client';

import { LoadingSpinner } from '@/components/common';

export default function GoogleCallbackPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Đang xử lý đăng nhập Google...</p>
        </div>
    );
}
