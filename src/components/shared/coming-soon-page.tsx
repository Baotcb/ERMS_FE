'use client'

import { Construction } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ComingSoonPageProps {
    title: string
    description?: string
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                <Construction className="w-10 h-10 text-amber-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {title}
            </h1>

            <p className="text-gray-500 max-w-md mb-8">
                {description || 'Tính năng này đang được phát triển và sẽ sớm được ra mắt. Vui lòng quay lại sau!'}
            </p>

            <div className="flex gap-4">
                <Link href="/enterprise/dashboard">
                    <Button variant="outline">
                        Về Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    )
}
