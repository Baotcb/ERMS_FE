import { Metadata } from 'next'
import { CVUpload } from '@/features/cv'

export const metadata: Metadata = {
    title: 'Quản lý CV | ERMS',
    description: 'Tải lên và quản lý CV của bạn',
}

export default function CVManagePage() {
    return <CVUpload />
}
