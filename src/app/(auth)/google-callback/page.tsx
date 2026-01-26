'use client';

import { useGoogleCallback } from '@/features/core/auth/hooks/use-google-callback';

export default function GoogleCallbackPage() {
  useGoogleCallback();
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Đang hoàn tất đăng nhập Google...</p>
      </div>
    </div>
  );
}
