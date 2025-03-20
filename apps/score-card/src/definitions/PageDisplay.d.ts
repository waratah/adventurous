import { Question } from './question';

export interface PageDisplay {
  show?: boolean;
  heading: string;
  description?: string;
  level: string;
  questions: Question[];
}
