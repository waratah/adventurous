import { question } from './question';

export interface PageDisplay {
  show?: boolean;
  edit?: boolean;
  heading: string;
  level: string;
  questions: question[];
}
