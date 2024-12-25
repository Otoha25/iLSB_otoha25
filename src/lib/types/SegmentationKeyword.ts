import { QuestionKeywordId } from "./QuestionKeyword"

export type SegmentationKeywordId = string

type PlainSegmentationKeyword = {
    id: SegmentationKeywordId
    quekeyId: QuestionKeywordId
    parentSegkeyId: SegmentationKeywordId | null
    title: string
    sourceUrl: string,
}

export type SegmentationKeyword = PlainSegmentationKeyword
