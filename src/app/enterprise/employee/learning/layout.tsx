'use client';

import { usePathname } from 'next/navigation';
import { TrainingLayoutShell } from '@/features/core/components/training/training-layout-shell';

export default function EmployeeLearningLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Course detail pages use their own immersive layout — skip the shell
    if (pathname.includes('/learning/course/')) {
        return <>{children}</>;
    }

    return (
        <TrainingLayoutShell roleSegment="employee" title="Không gian Học tập (Employee)">
            {children}
        </TrainingLayoutShell>
    );
}
