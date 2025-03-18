import { Question } from './question';

export interface PageDisplay {
  show?: boolean;
  heading: string;
  level: string;
  questions: Question[];
}
