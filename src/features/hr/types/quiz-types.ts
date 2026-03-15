export interface CreateQuizCommand {
    quizTitle: string;
    description?: string;
    timeLimitMinutes?: number;
    passingScore: number;
    maxAttempts?: number;
    shuffleQuestions?: boolean;
    shuffleAnswers?: boolean;
    showCorrectAnswers?: boolean;
}

export interface CreateQuizQuestionCommand {
    questionText: string;
    options: string;
    correctAnswer: string;
    explanation?: string;
    points?: number;
    orderIndex: number;
}

export interface QuizQuestionDto {
    id: string;
    questionText: string;
    options: string;
    orderIndex: number;
}

export interface QuizResultDto {
    score: number;
    isPassed: boolean;
    correctAnswers: number;
    totalQuestions: number;
}