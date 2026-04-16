import { notFound, redirect } from "next/navigation";

import { getServerSession } from "@/lib/server-fetch";
import { trainingServerService } from "@/features/hr/api/training-server-service";
import { CourseResultPage } from "@/features/employee/components/learning/course-result-page";
import { canAccessLearningWorkspace } from "@/features/hr/utils/learning-access";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();
  if (!session.user || !canAccessLearningWorkspace(session.user, session.role))
    redirect("/enterprise/dept-head/dashboard");

  const { id } = await params;
  const course = await trainingServerService
    .getCourseDetails(id)
    .catch(() => null);
  if (!course) notFound();

  return (
    <CourseResultPage
      initialCourse={course}
      basePath="/enterprise/dept-head/learning/course"
      isClosed={course.status === "Closed"}
    />
  );
}
