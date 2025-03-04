/*** an answer to a single question that will be method. to question text. */

import { QuestionCode } from "./QuestionCode";

export interface answer {
  code: QuestionCode;
  done?: boolean;
  doneDate: Date;
  verified?: boolean;
  mappedCode?: QuestionCode;
}
