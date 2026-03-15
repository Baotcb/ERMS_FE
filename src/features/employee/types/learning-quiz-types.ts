export interface CourseProgressDto {
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    quizUnlocked: boolean;
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
