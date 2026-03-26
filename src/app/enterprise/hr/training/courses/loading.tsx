import { Skeleton } from '@/components/ui/skeleton';

export default function CoursesLoading() {
    return (
        <div className="space-y-5 max-w-7xl mx-auto p-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#0F4C75] mb-2">Quản lý khóa học</h1>
                    <Skeleton className="h-4 w-[300px] bg-gray-200" />
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1 gap-1 flex-shrink-0">
                    <Skeleton className="h-9 w-24 bg-gray-200 rounded-md" />
                    <Skeleton className="h-9 w-24 bg-gray-200 rounded-md" />
                </div>
            </div>

            <div className="flex items-center bg-white px-4 py-3 rounded-lg border border-gray-100 shadow-sm mt-6">
                <Skeleton className="h-10 w-full max-w-sm rounded-md bg-gray-100" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6 p-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                        <Skeleton className="h-5 w-[150px] bg-gray-200" />
                        <Skeleton className="h-5 w-[150px] bg-gray-200" />
                        <Skeleton className="h-5 w-[80px] bg-gray-200" />
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-3 w-1/3">
                                <Skeleton className="h-8 w-8 rounded-md bg-gray-200" />
                                <div className="space-y-1.5 flex-1">
                                    <Skeleton className="h-4 w-3/4 bg-gray-200" />
                                    <Skeleton className="h-3 w-1/2 bg-gray-100" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-[150px] bg-gray-100" />
                            <Skeleton className="h-4 w-[60px] bg-gray-100" />
                            <Skeleton className="h-4 w-[60px] bg-gray-100" />
                            <Skeleton className="h-6 w-[80px] bg-gray-200 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
