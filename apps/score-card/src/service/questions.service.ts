import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  CollectionReference,
  doc,
  DocumentData,
  Firestore,
  FirestoreDataConverter,
  getDoc,
  setDoc,
} from '@angular/fire/firestore';
import { combineLatest, map, Observable, ReplaySubject, take } from 'rxjs';
import { PageDisplay, Question, QuestionGroup, Section } from '../definitions';

@Injectable({
  providedIn: 'root',
})
export class QuestionsService {
  private currentGroupId = new ReplaySubject<string>(1);
  /** Provide the last read gate in list (zero is all) */
  groupId$ = this.currentGroupId.asObservable();

  private currentGroup = new ReplaySubject<QuestionGroup>(1);
  /** Provide the last read gate in list (zero is all) */
  selectedGroup$ = this.currentGroup.asObservable();

  private errorMessage = new ReplaySubject<string>(1);
  /** Provide the last error message from trying to save, etc */
  errorMessage$ = this.errorMessage.asObservable();

  allQuestions$: Observable<Question[]>;
  allQuestionGroups$: Observable<QuestionGroup[]>;
  sections$: Observable<PageDisplay[]>;

  private groupId?: string;

  private questionCollection: CollectionReference<Question, DocumentData>;
  private groupCollection: CollectionReference<QuestionGroup, DocumentData>;

  constructor(private store: Firestore) {
    this.questionCollection = collection(this.store, 'questions').withConverter(this.createQuestionConverter);
    this.groupCollection = collection(this.store, 'groups').withConverter(this.idConverter);

    this.allQuestions$ = collectionData(this.questionCollection);
    this.allQuestionGroups$ = collectionData(this.groupCollection);

    this.sections$ = combineLatest([this.allQuestions$, this.allQuestionGroups$, this.groupId$]).pipe(
      map(([questions, groups, groupId]) => {
        const list: PageDisplay[] = [];
        if (!groupId) {
          list.push({
            heading: 'All questions',
            level: undefined,
            questions,
            show: true,
            requiresSignOff: false,
          });
          return list;
        }
        const sections = groups.find(x => x.id === groupId);
        if (!sections) {
          list.push({
            heading: 'newGroup',
            level: undefined,
            questions,
            show: true,
            requiresSignOff: false,
          });
          return list;
        }

        return sections.pages.map(
          p =>
            <PageDisplay>{
              show: true,
              heading: p.heading,
              level: p.level,
              description: p.description,
              requiresSignOff: p.requiresSignOff || false,
              questions: p.questions.map(code => questions.find(x => code === x.code)).filter(x => x),
            }
        );
      })
    );

    this.currentGroupId.next('');
  }

  private idConverter: FirestoreDataConverter<QuestionGroup> = {
    toFirestore(modelObject) {
      const objToUpload = { ...modelObject } as DocumentData; // DocumentData is mutable
      delete objToUpload['id']; // make sure to remove ID so it's not uploaded to the document
      QuestionsService.clearUndefined(objToUpload);
      return objToUpload;
    },
    fromFirestore(snapshot, options) {
      const data = snapshot.data(options) as QuestionGroup; // "as Omit<Instance<typeof CompanyModel>, "id">" could be added here
      data.pages.forEach(p => {
        const questions: any[] = p.questions;
        p.questions = questions.map(q => {
          return typeof q === 'number' ? q.toString() : q;
        });
      });

      // spread data first, so an incorrectly stored id gets overridden
      return {
        ...data,
        id: snapshot.id,
      };
    },
  };

  private createQuestionConverter: FirestoreDataConverter<Question> = {
    toFirestore(modelObject) {
      const objToUpload = { ...modelObject } as DocumentData; // DocumentData is mutable
      delete objToUpload['code']; // make sure to remove ID so it's not uploaded to the document
      QuestionsService.clearUndefined(objToUpload);
      return objToUpload;
    },
    fromFirestore(snapshot, options) {
      const data = snapshot.data(options); // "as Omit<Instance<typeof CompanyModel>, "id">" could be added here

      // spread data first, so an incorrectly stored id gets overridden
      return <Question>{
        ...data,
        code: snapshot.id,
      };
    },
  };

  set group(id: string | undefined | null) {
    this.groupId = id || undefined;
    this.currentGroupId.next(id || '');
    this.allQuestionGroups$.pipe(take(1)).subscribe(list => {
      if (list) {
        const group = list.find(g => g.id === id);
        if (group) {
          this.currentGroup.next(group);
        }
      }
    });
  }
  get group(): string {
    return this.groupId || '';
  }

  public async updateQuestion(q: Question) {
    this.errorMessage.next('');

    if (q.code) {
      await setDoc(doc(this.questionCollection, q.code), q).catch(x => {
        console.error(x);
        this.errorMessage.next(x);
      });
    } else {
      const docRef = await addDoc(this.questionCollection, q).catch(x => {
        console.error(x);
        this.errorMessage.next(x);
      });
      q.code = docRef?.id || '';
    }
  }

  public async saveGroup(groupId: string, sections: PageDisplay[]) {
    this.errorMessage.next('');
    try {
      if (groupId) {
        const docRef = doc(this.groupCollection, groupId);
        const group = (await getDoc(docRef)).data();
        if (group) {
          group.pages = sections.map(x => ({
            heading: x.heading,
            level: x.level || 'safe',
            description: x.description || '',
            requiresSignOff: x.requiresSignOff,
            questions: x.questions.map(q => q.code),
          }));

          await setDoc(docRef, group);

          return group;
        }
      }

      const group: QuestionGroup = {
        id: groupId,
        name: 'Unknown',
        books: {},
        pages: sections.map(x => {
          const section: Section = {
            heading: x.heading,
            level: x.level || 'safe',
            description: x.description || '',
            questions: x.questions.map(q => q.code),
          };
          return section;
        }),
      };
      const ref = await addDoc(this.groupCollection, group);
      group.id = ref?.id || '';
      return group;
    } catch (error) {
      console.error(error);
      this.errorMessage.next(error as string);
      return null;
    }
  }

  async updateGroup(group: QuestionGroup) {
    this.errorMessage.next('');
    try {
      if (group.id) {
        const docRef = doc(this.groupCollection, group.id);
        await setDoc(docRef, group);
        return group;
      }

      const ref = await addDoc(this.groupCollection, group);
      group.id = ref?.id || '';
      return group;
    } catch (error) {
      console.error(error);
      this.errorMessage.next(error as string);
      return null;
    }
  }

  static clearUndefined(objToUpload: any) {
    Object.keys(objToUpload).forEach(key => {
      if (!objToUpload[key]) {
        delete objToUpload[key];
      }
      if (Array.isArray(objToUpload[key])) {
        objToUpload[key].forEach(x => {
          this.clearUndefined(x);
        });
      }
    });
  }
}
