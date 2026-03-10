import { Suspense } from 'react';
import { TeachingTasksPage } from '@/features/employee/components/teaching/teaching-tasks-page';
import { Loader2 } from 'lucide-react';

export default async function Page() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#0F4C75]" />
            </div>
        }>
            <TeachingTasksPage />
        </Suspense>
    );
}
