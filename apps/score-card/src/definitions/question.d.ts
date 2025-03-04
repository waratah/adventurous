import { questionCode } from "./QuestionCode";

export interface question {
  code: questionCode;
  text: string;
  attachmentRequired?: boolean;
}
