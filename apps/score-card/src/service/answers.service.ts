import { Injectable } from '@angular/core';
import {
  collection,
  CollectionReference,
  doc,
  DocumentData,
  Firestore,
  FirestoreDataConverter,
  getDoc,
  setDoc,
} from '@angular/fire/firestore';
import { ReplaySubject } from 'rxjs';
import { Answer, AnswerStore } from '../definitions';
import { SyncStatusService } from './sync-status.service';

@Injectable({
  providedIn: 'root',
})
export class AnswersService {
  private myId = '';
  private currentAnswers: Answer[] = [];

  private answers = new ReplaySubject<Answer[]>(1);
  answers$ = this.answers.asObservable();

  private answerCollection: CollectionReference<AnswerStore, DocumentData>;

  constructor(private store: Firestore, private syncStatus: SyncStatusService) {
    this.answerCollection = collection(this.store, 'answers').withConverter(this.createAnswerConverter);
  }

  private createAnswerConverter: FirestoreDataConverter<AnswerStore> = {
    toFirestore(modelObject) {
      const answers = Array.isArray(modelObject.answers) ? (modelObject.answers as Answer[]) : [];
      const objToUpload = {
        ...modelObject,
        answers: answers.map(answer => AnswersService.serializeAnswer(answer)),
      } as DocumentData; // DocumentData is mutable
      delete objToUpload['scoutNumber']; // make sure to remove ID so it's not uploaded to the document
      Object.keys(objToUpload).forEach(key => {
        if (!objToUpload[key]) {
          delete objToUpload[key];
        }
      });
      return objToUpload;
    },
    fromFirestore(snapshot, options) {
      const data = snapshot.data(options); // "as Omit<Instance<typeof CompanyModel>, "id">" could be added here
      // spread data first, so an incorrectly stored id gets overridden
      return <AnswerStore>{
        ...data,
        answers: (data['answers'] || []).map((answer: Answer) => AnswersService.hydrateAnswer(answer)),
        scoutNumber: snapshot.id,
      };
    },
  };

  private static serializeAnswer(answer: Answer): DocumentData {
    return Object.entries(answer).reduce<DocumentData>((result, [key, value]) => {
      if (value !== undefined && value !== '') {
        result[key] = value;
      }
      return result;
    }, {});
  }

  private static hydrateAnswer(answer: Answer): Answer {
    return {
      ...answer,
      doneDate: AnswersService.toDate(answer.doneDate) || new Date(),
      verifiedDate: answer.verifiedDate ? AnswersService.toDate(answer.verifiedDate) : undefined,
      updatedAt: answer.updatedAt ? AnswersService.toDate(answer.updatedAt) : undefined,
    };
  }

  private static toDate(value?: Date | { toDate: () => Date }): Date | undefined {
    if (!value) {
      return undefined;
    }
    return value instanceof Date ? value : value.toDate();
  }

  private loadAnswers(id: string) {
    if (id) {
      getDoc(doc(this.answerCollection, id))
        .then(d => {
          const result = d.data() as AnswerStore | undefined;
          this.currentAnswers = result?.answers || [];
          this.answers.next(this.currentAnswers);
        })
        .catch(error => {
          console.error(error);
          this.currentAnswers = [];
          this.answers.next(this.currentAnswers);
        });
    } else {
      this.currentAnswers = [];
      this.answers.next(this.currentAnswers);
    }
  }

  public set userId(id: string) {
    this.myId = id;
    this.loadAnswers(this.myId);
  }

  // temporary to negate check
  public get userId(): string {
    return this.myId;
  }

  updateAnswer(answer: Answer, actorId = this.myId) {
    if (!this.myId) return;

    const docRef = doc(this.answerCollection, this.myId);
    const previous = this.currentAnswers.find(x => x.code === answer.code);
    const done = previous?.verified ? true : answer.done;
    const verified = previous?.verified || answer.verified;
    const nextAnswer: Answer = {
      ...previous,
      ...answer,
      done,
      doneBy: done ? previous?.doneBy || answer.doneBy || actorId : undefined,
      doneDate: done ? answer.doneDate || previous?.doneDate || new Date() : answer.doneDate,
      verified,
      verifiedBy: verified ? previous?.verifiedBy || answer.verifiedBy : undefined,
      verifiedDate: verified ? previous?.verifiedDate || answer.verifiedDate : undefined,
      updatedAt: new Date(),
    };

    if (previous) {
      this.currentAnswers = [...this.currentAnswers.filter(x => x.code != answer.code), nextAnswer];
    } else {
      this.currentAnswers = [...this.currentAnswers, nextAnswer];
    }

    const store: AnswerStore = {
      scoutNumber: this.myId,
      answers: this.currentAnswers,
    };

    this.answers.next(this.currentAnswers);
    this.syncStatus.trackWrite(setDoc(docRef, store)).catch(error => console.error(error));
  }

  public updateVerify(questionId: string, value: boolean, verifierId = this.myId) {
    if (!this.myId) {
      console.error('Verify when not signed in');
      return;
    }
    const docRef = doc(this.answerCollection, this.myId);
    const previous = this.currentAnswers.find(x => x.code === questionId);

    if (!previous?.done) {
      console.warn('Cannot verify an activity before the trainee has marked it done', { questionId, userId: this.myId });
      return;
    }

    const nextAnswer: Answer = {
      ...previous,
      verified: value,
      verifiedBy: value ? verifierId : undefined,
      verifiedDate: value ? new Date() : undefined,
      updatedAt: new Date(),
    };
    this.currentAnswers = [...this.currentAnswers.filter(x => x.code !== questionId), nextAnswer];

    const store: AnswerStore = {
      scoutNumber: this.myId,
      answers: this.currentAnswers,
    };

    this.answers.next(this.currentAnswers);
    this.syncStatus.trackWrite(setDoc(docRef, store)).catch(error => console.error(error));
  }
}
