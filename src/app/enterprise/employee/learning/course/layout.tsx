/**
 * Course detail pages bypass the TrainingLayoutShell to use 
 * a full-width immersive learning layout (Coursera-style).
 */
export default function CourseLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
