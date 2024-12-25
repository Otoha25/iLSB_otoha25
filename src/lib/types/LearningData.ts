import { QuestionKeywordId } from "./QuestionKeyword";

const symbol = Symbol('learningData')

type IsLearningData = {
    [symbol]: true
}

export type LearningData = Readonly<{
    rootQuekeyId: QuestionKeywordId
    username: string
    startedDate: string | null
    endedDate: string | null
} & IsLearningData>;

function createLearningData(username: string, rootQuekeyId: QuestionKeywordId): LearningData {
    return {
        username,
        rootQuekeyId,
        startedDate: null,
        endedDate: null,
        [symbol]: true,
    };
}

function setLearningStartedDate(learningData: LearningData, date: Date): LearningData {
    const startedDate = JSON.stringify(date);
    return {
        ...learningData,
        startedDate
    };
}

function setLearningEndedDate(learningData: LearningData, date: Date): LearningData {
    const endedDate = JSON.stringify(date);
    return {
        ...learningData,
        endedDate
    };
}
