import { LevelCode } from './LevelCode';
import { Question } from './question';

export interface PageDisplay {
  show?: boolean;
  heading: string;
  description?: string;
  level: LevelCode | undefined;
  requiresSignOff: boolean;
  questions: Question[];
}
