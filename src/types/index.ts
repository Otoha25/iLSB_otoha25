type QuestionKeywordId = string
type SegmentationKeywordId = string

type PlainQuestionKeyword = {
    id: QuestionKeywordId
    segkeyId: SegmentationKeywordId
    parentId: QuestionKeywordId | null
    title: string

    nodeX: number
    nodeY: number
    nodeWidth: number
    nodeHeight: number
}

type PlainSegmentationKeyword = {
    id: SegmentationKeywordId
    quekeyId: QuestionKeywordId
    parentSegkeyId: SegmentationKeywordId | null
    title: string
    
}
