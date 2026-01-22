/**
 * Login Page Hero Section
 * Separated UI component for better maintainability
 */

import { Award } from 'lucide-react'

export function LoginHero() {
  return (
    <div className="hidden md:block w-1/2 bg-brand-dark relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-secondary opacity-10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-brand-coral opacity-10 blur-3xl" />

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-12 text-white">

        {/* Hat Icon */}
        <div className="mb-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl inline-block border border-white/10 shadow-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brand-secondary"
          >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>

        <h2 className="text-3xl font-bold mb-4">Trao quyền cho sự phát triển của bạn</h2>
        <p className="text-lg text-brand-secondary max-w-sm mx-auto leading-relaxed">
          Tham gia cùng hàng ngàn chuyên gia đang nâng cao sự nghiệp của họ
          thông qua các chương trình đào tạo đẳng cấp thế giới.
        </p>

        {/* Stats Card */}
        <div className="mt-12 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 max-w-sm mx-auto shadow-lg w-full">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex -space-x-3 overflow-hidden">
              <img src="https://github.com/shadcn.png" alt="User" className="w-10 h-10 rounded-full border-2 border-brand-dark" />
              <img src="https://github.com/shadcn.png" alt="User" className="w-10 h-10 rounded-full border-2 border-brand-dark" />
              <img src="https://github.com/shadcn.png" alt="User" className="w-10 h-10 rounded-full border-2 border-brand-dark" />
            </div>
            <span className="text-sm font-medium text-white">
              500+ Ứng viên mới
            </span>
          </div>

          <div className="h-1.5 w-full bg-brand-dark/50 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-brand-coral w-3/4 rounded-full" />
          </div>

          <p className="text-xs text-brand-secondary text-left">
            Tỷ lệ hoàn thành đào tạo tăng 75% trong quý này.
          </p>
        </div>
      </div>
    </div>
  )
}

