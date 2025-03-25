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
import { PageDisplay, Question, questionGroup } from '../definitions';

@Injectable({
  providedIn: 'root',
})
export class QuestionsService {
  private currentGroupId = new ReplaySubject<string>(1);
  /** Provide the last read gate in list (zero is all) */
  groupId$ = this.currentGroupId.asObservable();

  private currentGroup = new ReplaySubject<questionGroup>(1);
  /** Provide the last read gate in list (zero is all) */
  selectedGroup$ = this.currentGroup.asObservable();

  allQuestions$: Observable<Question[]>;
  allQuestionGroups$: Observable<questionGroup[]>;
  sections$: Observable<PageDisplay[]>;

  private groupId?: string;

  private questionCollection: CollectionReference<Question, DocumentData>;
  private groupCollection: CollectionReference<questionGroup, DocumentData>;

  constructor(private store: Firestore) {
    this.questionCollection = collection(this.store, 'questions').withConverter(
      this.createQuestionConverter
    );
    this.groupCollection = collection(this.store, 'groups').withConverter(
      this.idConverter
    );

    this.allQuestions$ = collectionData(this.questionCollection);
    this.allQuestionGroups$ = collectionData(this.groupCollection);

    this.sections$ = combineLatest([
      this.allQuestions$,
      this.allQuestionGroups$,
      this.groupId$,
    ]).pipe(
      map(([questions, groups, groupId]) => {
        const list: PageDisplay[] = [];
        if (!groupId) {
          list.push({
            heading: 'All questions',
            level: 'None',
            questions,
            show: true,
          });
          return list;
        }
        const sections = groups.find((x) => x.id === groupId);
        if (!sections) {
          list.push({
            heading: 'newGroup',
            level: 'None',
            questions,
            show: true,
          });
          return list;
        }

        return sections.pages.map(
          (p) =>
            <PageDisplay>{
              show: true,
              heading: p.heading,
              level: p.level,
              description: p.description,
              questions: p.questions.map((code) =>
                questions.find((x) => code === x.code)
              ).filter(x=>x),
            }
        );
      })
    );

    this.currentGroupId.next('');
  }

  private idConverter: FirestoreDataConverter<questionGroup> = {
    toFirestore(modelObject) {
      const objToUpload = { ...modelObject } as DocumentData; // DocumentData is mutable
      delete objToUpload['id']; // make sure to remove ID so it's not uploaded to the document
      Object.keys(objToUpload).forEach((key) => {
        if (!objToUpload[key]) {
          delete objToUpload[key];
        }
      });
      return objToUpload;
    },
    fromFirestore(snapshot, options) {
      const data = snapshot.data(options) as questionGroup; // "as Omit<Instance<typeof CompanyModel>, "id">" could be added here
      data.pages.forEach((p) => {
        const questions: any[] = p.questions;
        p.questions = questions.map((q) => {
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
      Object.keys(objToUpload).forEach((key) => {
        if (!objToUpload[key]) {
          delete objToUpload[key];
        }
      });

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
    this.allQuestionGroups$.pipe(take(1)).subscribe((list) => {
      if (list) {
        const group = list.find((g) => g.id === id);
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
    if (q.code) {
      await setDoc(doc(this.questionCollection, q.code), q).catch((x) =>
        console.error(x)
      );
    } else {
      const docRef = await addDoc(this.questionCollection, q).catch((x) =>
        console.error(x)
      );
      q.code = docRef?.id || '';
    }
  }

  public async saveGroup(groupId: string, sections: PageDisplay[]) {
    try {
      if (groupId) {
        const docRef = doc(this.groupCollection, groupId);
        const group = (await getDoc(docRef)).data();
        if (group) {
          group.pages = sections.map((x) => ({
            heading: x.heading,
            level: x.level,
            description: x.description || '',
            questions: x.questions.map((q) => q.code),
          }));

          await setDoc(docRef, group);

          return group;
        }
      }

      const group: questionGroup = {
        id: groupId,
        name: 'Unknown',
        books: {},
        pages: sections.map((x) => ({
          heading: x.heading,
          level: x.level,
          description: x.description || '',
          questions: x.questions.map((q) => q.code),
        })),
      };
      const ref = await addDoc(this.groupCollection, group);
      group.id = ref?.id || '';
      return group;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async updateGroup(group: questionGroup) {
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
      return null;
    }
  }
}
