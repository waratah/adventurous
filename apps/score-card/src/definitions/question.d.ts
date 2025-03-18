export type QuestionType = 'checkbox' | 'img' | 'textbox' | 'url';

export interface Question {
  code: string;
  text: string;
  url?: string;
  img?: string;
  placeholder?: string;
  attachmentRequired?: boolean;
  type?: QueryConstraintType;
}
