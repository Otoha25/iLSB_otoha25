import { SegmentationKeywordId } from "./SegmentationKeyword";

export type QuestionKeywordId = string;

type PlainQuestionKeyword = {
	id: QuestionKeywordId;
	segkeyId: SegmentationKeywordId | null;
	parentId: QuestionKeywordId | null;
	title: string;

	nodeX: number;
	nodeY: number;
	nodeWidth: number;
	nodeHeight: number;
};

export type QuestionKeyword = PlainQuestionKeyword;

// function createQuestionKeyword(title: string, nodeX?: number, nodeY?: number, nodeWidth?: number, nodeHeight?: number) {
//     const id =

//     return {

//     }
// }
