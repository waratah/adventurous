import { LevelCode } from './LevelCode';

export interface page {
  heading: string;
  level: LevelCode;
  questions: string[];
}

export interface questionGroup {
  id: string;
  name: string;

  pages: page[];
}
