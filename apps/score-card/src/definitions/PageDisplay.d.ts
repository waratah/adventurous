import { Question } from './question';

export interface PageDisplay {
  show?: boolean;
  heading: string;
  description?: string;
  level: string;
  requiresSignOff: boolean;
  questions: Question[];
}
