import { notFound, redirect } from "next/navigation";

import { getServerSession } from "@/lib/server-fetch";
import { trainingServerService } from "@/features/hr/api/training-server-service";
import { CourseResultPage } from "@/features/employee/components/learning/course-result-page";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();

  if (!session.user) {
    redirect("/login");
  }

  const { id } = await params;
  const course = await trainingServerService
    .getCourseDetails(id)
    .catch(() => null);

  if (!course) {
    notFound();
  }

  return (
    <CourseResultPage
      initialCourse={course}
      isClosed={course.status === "Closed"}
    />
  );
}
