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
  doneBy?: string;
  verified?: boolean;
  verifiedBy?: string;
  verifiedDate?: Date;
  updatedAt?: Date;
  mappedCode?: string;
  proof?: string;
}
