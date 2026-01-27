import { RoleSelection } from '@/features/core/auth/components/role-selection'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'ERMS',
    description: 'Chọn vai trò ',
}

export default function RoleSelectionPage() {
    return (
        <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-80px)] py-10">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
                <RoleSelection />
            </div>
        </div>
    )
}
