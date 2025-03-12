import { LevelCode } from './LevelCode';

export interface page {
  level: LevelCode;
  questions: string[];
}

export interface questionGroup {
  id: string;
  name: string;

  pages: page[];
}
