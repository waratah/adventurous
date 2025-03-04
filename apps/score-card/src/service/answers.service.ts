import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { take, from, ReplaySubject } from 'rxjs';
import { answer, User, UserId } from '../definitions';

@Injectable({
  providedIn: 'root',
})
export class AnswersService {
  private myId = '174424';

  private baseline: answer[] = [];

  private allAnswers = new ReplaySubject<answer[]>(1);
  answers$ = this.allAnswers.asObservable();

  constructor(private store: Firestore) {
    this.allAnswers.next(this.baseline);

    this.loadAnswers(this.myId);
  }

  private loadAnswers(id: string) {
    getDoc(doc(this.store, 'answers', id)).then((d) => {
      const result  = d.data() as User | undefined;
      if (result?.answers) {
        this.allAnswers.next(result.answers);
      } else {
        this.allAnswers.next([]);
      }
    });
    // this.answers$.subscribe((x) => console.log(x));
  }

  public set userId(id: UserId) {
    this.myId = `${id}`;
    this.loadAnswers(this.myId);
  }

  // temporary to negate check
  public get userId(): UserId {
    return Number(this.myId);
  }

  public updateAnswer(questionId: number, value: boolean) {
    this.answers$.pipe(take(1)).subscribe((list) => {
      const docRef = doc(this.store, 'answers', this.myId);
      let answer = list.find((x) => x.code === questionId);
      if (!answer) {
        if (value) {
          answer = { code: questionId, done: true, doneDate: new Date() };
          list.push(answer);
          from(setDoc(docRef, { answers: list }));
        }
        return;
      }

      answer.done = value;
      from(setDoc(docRef, { answers: list }));
    });
  }

  public updateVerify(questionId: number, value: boolean) {
    this.answers$.pipe(take(1)).subscribe((list) => {
      const docRef = doc(this.store, 'answers', this.myId);

      let answer = list.find((x) => x.code === questionId);
      if (!answer) {
        if (value) {
          answer = {
            code: questionId,
            done: true,
            doneDate: new Date(),
            verified: true,
          };
          list.push(answer);
        }
        from(setDoc(docRef, { answers: list }));
        return;
      }

      answer.verified = value;
      if (value) {
        answer.done = true;
        if (!answer.doneDate) {
          answer.doneDate = new Date();
        }
      }

      from(setDoc(docRef, { answers: list }));
    });
  }
}
