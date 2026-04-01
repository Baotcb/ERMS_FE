import { notFound, redirect } from "next/navigation";

import { getServerSession } from "@/lib/server-fetch";
import { trainingServerService } from "@/features/hr/api/training-server-service";
import { CourseReviewPage } from "@/features/employee/components/learning/course-review-page";

export default async function ReviewPage({
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

  // Server-side guard: if course requires final quiz, check that user has passed
  if (course.hasFinalQuiz) {
    const quizResult = await trainingServerService
      .getQuizResult(id)
      .catch(() => null);
    if (!quizResult?.isPassed) {
      redirect(`/enterprise/employee/learning/course/${id}/quiz`);
    }
  }

  return <CourseReviewPage initialCourse={course} />;
}
