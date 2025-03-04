import { GroupId } from './GroupId';
import { QuestionCode } from './QuestionCode';
import { LevelCode } from './LevelCode';

export interface page {
  level: string;
  questions: questionCode[];
}

export interface questionGroup {
  id: GroupId;
  name: string;
  pages: page[];
}
