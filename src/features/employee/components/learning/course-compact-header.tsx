"use client";

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
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3">
        <span className="text-brand-medium">Khóa học</span>
        {activeModuleName && (
          <>
            <span className="text-gray-300">›</span>
            <span className="text-brand-secondary">{activeModuleName}</span>
          </>
        )}
      </div>

      {/* Title with left accent */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-brand-secondary to-brand-medium" />
        <h1 className="text-xl lg:text-2xl font-black tracking-tight text-brand-primary">
          {courseName}
        </h1>
      </div>
    </div>
  );
}
