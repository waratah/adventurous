import { LevelCode } from './LevelCode';

export interface page {
  heading: string;
  level: LevelCode;
  requiresSignOff?: boolean
  description?: string;
  questions: string[];
}

export interface BookDetail {
  name: string;
  heading: string;
  footing: string;
}

export interface Books {
  safe?: BookDetail;
  trained?: BookDetail;
  assistantGuide?: BookDetail;
  guide?: BookDetail;
  assessor?: BookDetail;
}

export interface questionGroup {
  id: string;
  name: string;
  books: Books;

  pages: page[];
}
