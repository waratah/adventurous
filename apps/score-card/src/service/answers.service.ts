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
import { answer, answerStore as AnswerStore } from '../definitions';

@Injectable({
  providedIn: 'root',
})
export class AnswersService {
  private myId = '';

  private answers = new ReplaySubject<answer[]>(1);
  answers$ = this.answers.asObservable();

  private answerCollection: CollectionReference<AnswerStore, DocumentData>;

  constructor(private store: Firestore) {
    this.answerCollection = collection(this.store, 'answers').withConverter(
      this.createAnswerConverter
    );
  }

  private createAnswerConverter: FirestoreDataConverter<AnswerStore> = {
    toFirestore(modelObject) {
      const objToUpload = { ...modelObject } as DocumentData; // DocumentData is mutable
      delete objToUpload['scoutNumber']; // make sure to remove ID so it's not uploaded to the document
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
      console.log({data})
      // spread data first, so an incorrectly stored id gets overridden
      return <AnswerStore>{
        ...data,
        scoutNumber: snapshot.id,
      };
    },
  };

  private loadAnswers(id: string) {
    getDoc(doc(this.answerCollection, id)).then((d) => {
      const result = d.data() as AnswerStore | undefined;
      if (result?.answers) {
        this.answers.next(result.answers);
      } else {
        this.answers.next([]);
      }
    });
  }

  public set userId(id: string) {
    this.myId = id;
    this.loadAnswers(this.myId);
  }

  // temporary to negate check
  public get userId(): string {
    return this.myId;
  }

  updateCheck(questionId: string, value: boolean) {
   this. updateAnswer({
      code: questionId,
      done: value,
      doneDate: new Date(),
    })
  }

  updateText(questionId: string, value: string) {
    this.updateAnswer({
    code: questionId,
      done: Boolean(value),
      text: value,
      doneDate: new Date(),
 }) }

  private updateAnswer(answer: answer) {
    const docRef = doc(this.answerCollection, this.myId);
    getDoc(docRef).then((answerStore) => {
      const store = answerStore.data() || {
        scoutNumber: this.myId,
        answers: [],
      };
      const currentAnswers = store.answers
      const previous = currentAnswers.find((x) => x.code === answer.code);

      if (previous) {
        store.answers = [
          ... currentAnswers.filter( x=> x.code != answer.code),
          { ...previous, ...answer }
        ];
      } else {
          store.answers.push(answer);
      }
      this.answers.next(store.answers);
      setDoc(docRef, store).catch((error) => console.error(error));
    });
  }

  public updateVerify(questionId: string, value: boolean) {
    const docRef = doc(this.answerCollection, this.myId);
    getDoc(docRef).then((answerStore) => {
      const store = answerStore.data() || {
        scoutNumber: this.myId,
        answers: [],
      };

      const previous = store.answers.find((x) =>
        x.code.localeCompare(questionId)
      );
      if (!previous) {
        if (value) {
          store.answers.push({
            code: questionId,
            done: true,
            doneDate: new Date(),
            verified: true,
          });
        } // don't add value if it is not done anyway
      } else {
        previous.verified = value;
        if (!previous.done) {
          previous.done = true;
          previous.doneDate = new Date();
        } else {
          previous.done = true;
        }
      }
      this.answers.next(store.answers);
      setDoc(docRef, store);
    });
  }
}
