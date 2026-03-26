import { TrainingLayoutShell } from '@/features/core/components/training/training-layout-shell';

export default function DeptHeadTrainingLayout({ children }: { children: React.ReactNode }) {
    return (
        <TrainingLayoutShell roleSegment="dept-head" title="Không gian Trưởng phòng">
            {children}
        </TrainingLayoutShell>
    );
}
