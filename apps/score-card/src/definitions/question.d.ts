export interface question {
  code: string;
  text: string;
  url?: string;
  attachmentRequired?: boolean;
  type?: 'checkbox' | 'image' | 'textbox';
}
