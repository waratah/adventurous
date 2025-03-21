import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { combineLatest, map, Observable, Subscription } from 'rxjs';
import { answer, PageDisplay, Question, questionGroup } from '../definitions';
import { AnswersService } from '../service/answers.service';
import { QuestionsService } from '../service/questions.service';
import { CollapseComponent } from '../utils';
import { UsersService } from '../service/users.service';

interface detail {
  answer: answer;
  question: Question;
}

interface detailPage {
  heading?: string;
  description?: string;
  details: detail[];
  show: boolean;
  totalCount: number;
  doneCount: number;
  verifiedCount: number;
}

@Component({
  selector: 'app-score-card',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, CollapseComponent, MatButtonModule],
  templateUrl: './scoreCard.component.html',
  styleUrl: './scoreCard.component.css',
})
export class ScoreCardComponent implements OnInit, OnDestroy {
  @ViewChild('result') result?: ElementRef;

  public isVerify = false;

  public action = input<string>();
  public id = input<string>();

  public questions$: Observable<PageDisplay[]>;
  public groups$: Observable<questionGroup[]>;
  public detail$: Observable<detailPage[]>;

  private sub?: Subscription;

  constructor(
    public answerService: AnswersService,
    public usersService: UsersService,
    private route: ActivatedRoute,
    private questionsService: QuestionsService
  ) {
    effect(() => (this.isVerify = this.action() == 'verify'));
    effect(() => (this.questionsService.group = this.id()));
    this.answerService.userId = this.usersService.userId;

    this.questions$ = questionsService.sections$;
    this.groups$ = questionsService.allQuestionGroups$;
    this.detail$ = combineLatest([
      this.questions$,
      this.answerService.answers$,
    ]).pipe(
      map(([questions, answers]) => {
        return questions.map<detailPage>((p) => {
          const rv = <detailPage>{
            heading: p.heading,
            description: p.description,
            show: true,
            details: p.questions.filter(x=>x).map((q) => {
              const d = <detail>{
                question: q,
                answer: { code: q.code, doneDate: new Date() },
              };
              const found = answers.find((x) => x.code === q.code);
              if (found) {
                d.answer = found;
              }
              return d;
            }),
          };

          rv.doneCount = rv.details.reduce(
            (a, item) => a + (item.answer.done ? 1 : 0),
            0
          );

          // Images do not have an answer
          rv.totalCount = rv.details.reduce(
            (a, item) => a + (item.question.type !== 'img' ? 1 : 0),
            0
          );

          rv.verifiedCount = rv.details.reduce(
            (a, item) => a + (item.answer.verified ? 1 : 0),
            0
          );
          rv.show = rv.doneCount  != rv.totalCount;
          return rv;
        });
      })
    );
  }

  ngOnInit() {
    this.sub = this.route.paramMap.subscribe(
      (params) => (this.questionsService.group = params.get('id'))
    );
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
  public updateDone(id: string, value: boolean) {
    this.answerService.updateCheck(id, value);
  }
  public updateText(id: string, event: FocusEvent) {
    const target = event.target as HTMLInputElement;
    this.answerService.updateText(id, target.value);
  }

  public updateVerify(id: string, value: boolean) {
    this.answerService.updateVerify(id, value);
  }

  public print() {
    if (this.result) {
      const DATA = this.result.nativeElement;
      html2canvas(DATA).then((canvas) => {
        const fileWidth = 200;
        const fileHeight = (canvas.height * fileWidth) / canvas.width;

        const FileUri = canvas.toDataURL('image/png');
        const PDF = new jsPDF('p', 'mm', 'a4');
        PDF.addImage(FileUri, 'PNG', 5, 5, fileWidth, fileHeight);
        PDF.save('angular-demo.pdf');
      });
    } else {
      alert('mismatch with screen and pdf generation');
    }
  }
}
