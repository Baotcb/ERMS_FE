import { notFound, redirect } from "next/navigation";

import { getServerSession } from "@/lib/server-fetch";
import { trainingServerService } from "@/features/hr/api/training-server-service";
import { CourseLessonsPage } from "@/features/employee/components/learning/course-lessons-page";
import { canAccessLearningWorkspace } from "@/features/hr/utils/learning-access";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();

  if (
    !session.user ||
    !canAccessLearningWorkspace(session.user, session.role)
  ) {
    redirect("/enterprise/dept-head/dashboard");
  }

  const { id } = await params;
  const course = await trainingServerService
    .getCourseDetails(id)
    .catch(() => null);
  const progress = await trainingServerService
    .getCourseProgress(id)
    .catch(() => null);

  if (!course || !progress) {
    notFound();
  }

  return (
    <CourseLessonsPage
      initialCourse={course}
      initialProgress={progress}
      basePath="/enterprise/dept-head/learning/course"
      isClosed={course.status === "Closed"}
    />
  );
}
