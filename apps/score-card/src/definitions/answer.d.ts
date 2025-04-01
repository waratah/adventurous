/*** an answer to a single question that will be method. to question text. */

export interface AnswerStore {
  scoutNumber: string;
  answers: Answer[];
}

export interface Answer {
  code: string;
  done?: boolean;
  text?: string;
  doneDate: Date;
  verified?: boolean;
  mappedCode?: string;
  proof?: string;
}
