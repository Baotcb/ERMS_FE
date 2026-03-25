export const ANSWER_LABELS = ['A', 'B', 'C', 'D'] as const;

export function parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (ch === '"') {
            const next = line[i + 1];
            if (inQuotes && next === '"') {
                current += '"';
                i++;
                continue;
            }
            inQuotes = !inQuotes;
            continue;
        }

        if (ch === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
            continue;
        }

        current += ch;
    }

    values.push(current.trim());
    return values;
}

export async function parseQuestionsFromCsv(file: File): Promise<Array<{
    questionText: string;
    options: string;
    correctAnswer: string;
    points: number;
    orderIndex: number;
}>> {
    const csvText = (await file.text()).replace(/^\uFEFF/, '');
    const lines = csvText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length < 2) {
        throw new Error('File CSV không có dữ liệu câu hỏi.');
    }

    const header = parseCsvLine(lines[0]);
    const headerIndex = (name: string) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());

    const questionTextIdx = headerIndex('QuestionText');
    const optionAIdx = headerIndex('OptionA');
    const optionBIdx = headerIndex('OptionB');
    const optionCIdx = headerIndex('OptionC');
    const optionDIdx = headerIndex('OptionD');
    const correctAnswerIdx = headerIndex('CorrectAnswer');
    const pointsIdx = headerIndex('Points');
    const orderIndexIdx = headerIndex('OrderIndex');

    if ([questionTextIdx, optionAIdx, optionBIdx, optionCIdx, optionDIdx, correctAnswerIdx].some((idx) => idx < 0)) {
        throw new Error('Template CSV không đúng định dạng cột yêu cầu. Vui lòng tải lại template mới nhất.');
    }

    const preparedQuestions: Array<{
        questionText: string;
        options: string;
        correctAnswer: string;
        points: number;
        orderIndex: number;
    }> = [];

    for (let row = 1; row < lines.length; row++) {
        const values = parseCsvLine(lines[row]);

        const questionText = (values[questionTextIdx] || '').trim();
        const optionA = (values[optionAIdx] || '').trim();
        const optionB = (values[optionBIdx] || '').trim();
        const optionC = (values[optionCIdx] || '').trim();
        const optionD = (values[optionDIdx] || '').trim();
        const correctAnswer = (values[correctAnswerIdx] || '').trim().toUpperCase();

        if (!questionText && !optionA && !optionB && !optionC && !optionD) {
            continue;
        }

        if (!questionText || !optionA || !optionB || !optionC || !optionD) {
            throw new Error(`Dòng ${row + 1}: thiếu dữ liệu câu hỏi hoặc lựa chọn đáp án.`);
        }

        if (!ANSWER_LABELS.includes(correctAnswer as (typeof ANSWER_LABELS)[number])) {
            throw new Error(`Dòng ${row + 1}: CorrectAnswer phải là A/B/C/D.`);
        }

        const pointsRaw = values[pointsIdx] || '';
        const parsedPoints = Number(pointsRaw);
        const points = Number.isFinite(parsedPoints) && parsedPoints > 0 ? parsedPoints : 1;

        const orderRaw = values[orderIndexIdx] || '';
        const parsedOrder = Number(orderRaw);
        const orderIndex = Number.isFinite(parsedOrder) && parsedOrder > 0 ? parsedOrder : preparedQuestions.length + 1;

        preparedQuestions.push({
            questionText,
            options: JSON.stringify([optionA, optionB, optionC, optionD]),
            correctAnswer,
            points,
            orderIndex,
        });
    }

    if (preparedQuestions.length === 0) {
        throw new Error('File CSV không có câu hỏi hợp lệ để import.');
    }

    return preparedQuestions;
}
