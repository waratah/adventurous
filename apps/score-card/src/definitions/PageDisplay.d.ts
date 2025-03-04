import { question } from './question';

export interface PageDisplay {
  show?: boolean;
  heading: string;
  questions: question[];
}
