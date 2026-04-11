import { Skeleton } from '@/components/ui/skeleton';

export function AssignTrainingSkeleton() {
    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 animate-pulse p-6 mt-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full bg-gray-200" />
                    <div>
                        <Skeleton className="h-7 w-[200px] bg-gray-200 mb-2" />
                        <Skeleton className="h-4 w-[350px] bg-gray-100" />
                    </div>
                </div>
                <Skeleton className="h-10 w-[150px] rounded-full bg-gray-200" />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 space-y-8 border border-gray-100">
                {/* Step 1 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-6 h-6 rounded-full bg-gray-200" />
                        <Skeleton className="h-4 w-[120px] bg-gray-200" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-[250px] bg-gray-100 mb-3" />
                        <Skeleton className="h-12 w-full md:w-[600px] rounded-xl bg-gray-100" />
                    </div>
                </div>

                {/* Step 2 wrapper */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-gray-100 mt-4">
                    {/* Step 2.1 */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-6 h-6 rounded-full bg-gray-200" />
                            <Skeleton className="h-4 w-[180px] bg-gray-200" />
                        </div>
                        <Skeleton className="h-10 w-full bg-gray-100" />
                        
                        <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4 space-y-3 mt-4">
                            <div className="flex items-start gap-4">
                                <Skeleton className="w-10 h-10 rounded-full bg-gray-200" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-[140px] bg-gray-200" />
                                    <Skeleton className="h-4 w-[180px] bg-gray-200" />
                                    <Skeleton className="h-3 w-[100px] bg-gray-200" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2.2 */}
                    <div className="lg:col-span-8 bg-gray-50/30 rounded-xl border border-gray-100 p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-6 h-6 rounded-full bg-gray-200" />
                                <Skeleton className="h-4 w-[150px] bg-gray-200" />
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <Skeleton className="h-10 w-[220px] rounded-md bg-white border border-gray-200" />
                                <Skeleton className="h-10 w-[200px] rounded-md bg-white border border-gray-200" />
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-[250px] bg-gray-200" />
                                <Skeleton className="h-3 w-[300px] bg-gray-100" />
                            </div>
                            <Skeleton className="h-6 w-10 rounded-full bg-gray-200" />
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4 min-h-[400px]">
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                                <Skeleton className="h-4 w-[20px] rounded-sm bg-gray-200" />
                                <Skeleton className="h-4 w-[120px] bg-gray-200" />
                                <Skeleton className="h-4 w-[100px] bg-gray-200" />
                                <Skeleton className="h-4 w-[80px] bg-gray-200 ml-auto" />
                            </div>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">
                                    <Skeleton className="h-4 w-[20px] rounded-sm bg-gray-200" />
                                    <div className="flex items-center gap-3 w-1/3">
                                        <Skeleton className="h-8 w-8 rounded-full bg-gray-200" />
                                        <div className="space-y-1.5 flex-1">
                                            <Skeleton className="h-4 w-3/4 bg-gray-200" />
                                            <Skeleton className="h-3 w-1/2 bg-gray-100" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-4 w-[100px] bg-gray-100" />
                                    <Skeleton className="h-4 w-[80px] bg-gray-100" />
                                    <Skeleton className="h-6 w-[80px] rounded-full bg-gray-200 ml-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
