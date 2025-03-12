import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  collection,
  FirestoreDataConverter,
  collectionData,
  CollectionReference,
  DocumentData,
  addDoc,
} from '@angular/fire/firestore';
import { PageDisplay, question, questionGroup } from '../definitions';
import { combineLatest, map, Observable, ReplaySubject, take } from 'rxjs';

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

  allQuestions$: Observable<question[]>;
  allQuestionGroups$: Observable<questionGroup[]>;
  questions$: Observable<PageDisplay[]>;

  private groupId?: string;

  private questionCollection: CollectionReference<question, DocumentData>;
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

    this.questions$ = combineLatest([
      this.allQuestions$,
      this.allQuestionGroups$,
      this.groupId$,
    ]).pipe(
      map(([questions, groups, groupId]) => {
        const list: PageDisplay[] = [];
        if (!groupId) {
          list.push({ heading: 'All questions', level: 'None', questions, show: true });
          return list;
        }
        const questionLink = groups.find((x) => x.id === groupId);
        if (!questionLink) {
          list.push({ heading: 'newGroup', level: 'None', questions, show: true });
          return list;
        }
        return questionLink.pages.map(
          (p) =>
            <PageDisplay>{
              show: true,
              heading: p.level,
              questions: questions.filter((x) =>
                p.questions.some((l) => l === x.code)
              ),
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

  private createQuestionConverter: FirestoreDataConverter<question> = {
    toFirestore(modelObject) {
      const objToUpload = { ...modelObject } as DocumentData; // DocumentData is mutable
      delete objToUpload['code']; // make sure to remove ID so it's not uploaded to the document
      Object.keys(objToUpload).forEach((key) => {
        if (!objToUpload[key]) {
          delete objToUpload[key];
        }
      });

      console.log({ objToUpload, modelObject });
      return objToUpload;
    },
    fromFirestore(snapshot, options) {
      const data = snapshot.data(options); // "as Omit<Instance<typeof CompanyModel>, "id">" could be added here

      // spread data first, so an incorrectly stored id gets overridden
      return <question>{
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

  public async updateQuestion(q: question) {
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

  public createGroup(name: string) {
    this.saveGroup('', name, []);
  }

  public async saveGroup(groupId: string, name: string, pages: PageDisplay[]) {
    const group: questionGroup = {
      id: groupId,
      name: name || 'New Name',
      pages: pages.map((x) => ({
        level: x.heading,
        questions: x.questions.map((q) => q.code),
      })),
    };

    if (group.id) {
      const docRef = doc(this.groupCollection, groupId);
      await setDoc(docRef, group).catch((x) => console.error(x));
      return group;
    } else {
      const ref = await addDoc(this.groupCollection, group).catch((x) =>
        console.error(x)
      );
      group.id = ref?.id || '';
      return group;
    }
  }
}
