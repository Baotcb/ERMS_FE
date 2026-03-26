'use client';

interface CourseCompactHeaderProps {
    courseName: string;
    activeModuleName?: string;
}

export function CourseCompactHeader({
    courseName,
    activeModuleName,
}: CourseCompactHeaderProps) {
    return (
        <div className="mb-6 pb-5 border-b border-gray-100">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest mb-3">
                <span className="text-[#3282B8]">Khóa học</span>
                {activeModuleName && (
                    <>
                        <span className="text-gray-300">›</span>
                        <span className="text-[#E8731A]">{activeModuleName}</span>
                    </>
                )}
            </div>

            {/* Title with left accent */}
            <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full bg-gradient-to-b from-[#E8731A] to-[#3282B8]" />
                <h1 className="text-xl lg:text-2xl font-black tracking-tight text-[#0F3B64]">
                    {courseName}
                </h1>
            </div>
        </div>
    );
}
