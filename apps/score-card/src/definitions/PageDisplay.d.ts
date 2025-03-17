import { question } from './question';

export interface PageDisplay {
  show?: boolean;
  heading: string;
  level: string;
  questions: question[];
}
