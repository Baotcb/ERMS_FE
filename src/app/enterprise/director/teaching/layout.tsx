import { TrainingLayoutShell } from '@/features/core/components/training/training-layout-shell';

export default function DirectorTeachingLayout({ children }: { children: React.ReactNode }) {
    return (
        <TrainingLayoutShell roleSegment="director" title="Không gian Giảng viên (Director)">
            {children}
        </TrainingLayoutShell>
    );
}
