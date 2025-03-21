/*** an answer to a single question that will be method. to question text. */

export interface answerStore {
  scoutNumber: string;
  answers: answer[];
}

export interface answer {
  code: string;
  done?: boolean;
  text?: string;
  doneDate: Date;
  verified?: boolean;
  mappedCode?: string;
}
