import { TrainingLayoutShell } from '@/features/core/components/training/training-layout-shell';

export default function EmployeeLearningLayout({ children }: { children: React.ReactNode }) {
    return (
        <TrainingLayoutShell roleSegment="employee" title="Không gian Học tập (Employee)">
            {children}
        </TrainingLayoutShell>
    );
}
