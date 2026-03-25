export interface CourseProgressDto {
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    quizUnlocked: boolean;
}

export interface UpdateLessonProgressCommand {
    lessonId: string;
    watchPercentage: number;
    lastPosition?: number;
    timeSpentMinutes: number;
}

export interface LearnerQuizQuestionDto {
    id: string;
    questionText: string;
    options: string;
    orderIndex: number;
}

export interface LearnerQuizResultDto {
    score: number;
    isPassed: boolean;
    correctAnswers: number;
    totalQuestions: number;
}

export interface SubmitLearnerAnswerCommand {
    questionId: string;
    selectedAnswer: string;
}

export interface QuizReviewItemDto {
    orderIndex: number;
    questionText: string;
    options: string;
    selectedAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string | null;
}

export interface QuizReviewDto {
    score: number;
    isPassed: boolean;
    correctAnswers: number;
    totalQuestions: number;
    items: QuizReviewItemDto[];
}

