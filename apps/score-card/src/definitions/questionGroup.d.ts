import { LevelCode } from './LevelCode';

export interface Section {
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
  assist?: BookDetail;
  guide?: BookDetail;
  assessor?: BookDetail;
}

export interface QuestionGroup {
  id: string;
  name: string;
  books: Books;

  pages: Section[];
}
