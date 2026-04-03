import { TrainingLayoutShell } from '@/features/core/components/training/training-layout-shell';

export default function HRTrainingLayout({ children }: { children: React.ReactNode }) {
    return (
        <TrainingLayoutShell roleSegment="hr" title="Quản lý Đào tạo (HR)">
            {children}
        </TrainingLayoutShell>
    );
}
