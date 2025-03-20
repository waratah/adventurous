import { LevelCode } from './LevelCode';

export interface page {
  heading: string;
  level: LevelCode;
  description?: string;
  questions: string[];
}

export interface questionGroup {
  id: string;
  name: string;

  pages: page[];
}
