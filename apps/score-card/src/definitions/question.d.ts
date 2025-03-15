export interface question {
  code: string;
  text: string;
  url?: string;
  img?: string;
  attachmentRequired?: boolean;
  type?: 'checkbox' | 'img' | 'textbox' | 'url';
}
