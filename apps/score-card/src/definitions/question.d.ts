export type questionType = 'checkbox' | 'img' | 'textbox' | 'url';

export interface question {
  code: string;
  text: string;
  url?: string;
  img?: string;
  placeholder?: string;
  attachmentRequired?: boolean;
  type?: QueryConstraintType;
}
