import { AsyncPipe, NgClass } from '@angular/common';
import { Component, effect, ElementRef, input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { combineLatest, map, Observable, Subscription } from 'rxjs';
import { Answer, PageDisplay, Question, QuestionGroup, UploadParameters, UploadResult } from '../definitions';
import { DialogUploadComponent, DialogViewComponent, DialogViewOptions } from '../dialog';
import { AnswersService, QuestionsService, UsersService } from '../service';
import { CollapseComponent } from '../utils';

interface Detail {
  answer: Answer;
  question: Question;
}

interface DetailPage {
  heading?: string;
  description?: string;
  details: Detail[];
  show: boolean;
  totalCount: number;
  doneCount: number;
  verifiedCount: number;
  level: string;
}

@Component({
  selector: 'app-score-card',
  standalone: true,
  imports: [AsyncPipe, NgClass, MatIconModule, MatToolbarModule, CollapseComponent, MatButtonModule, MatCardModule],
  templateUrl: './scoreCard.component.html',
  styleUrl: './scoreCard.component.css',
})
export class ScoreCardComponent implements OnInit, OnDestroy {
  @ViewChild('result') result?: ElementRef;

  public isVerify = false;

  public action = input<string>();
  public id = input<string>();

  public questions$: Observable<PageDisplay[]>;
  public groups$: Observable<QuestionGroup[]>;
  public detail$: Observable<DetailPage[]>;

  private sub?: Subscription;

  constructor(
    private answerService: AnswersService,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private questionsService: QuestionsService,
    private dialog: MatDialog
  ) {
    effect(() => (this.isVerify = this.action() == 'verify'));
    effect(() => (this.questionsService.group = this.id()));
    this.answerService.userId = this.usersService.userId;

    this.questions$ = questionsService.sections$;
    this.groups$ = questionsService.allQuestionGroups$;
    this.detail$ = combineLatest([this.questions$, this.answerService.answers$]).pipe(
      map(([questions, answers]) => {
        return questions.map<DetailPage>(p => {
          const rv = <DetailPage>{
            heading: p.heading,
            description: p.description,
            show: true,
            level: p.level,
            details: p.questions
              .filter(x => x)
              .map(q => {
                const d = <Detail>{
                  question: q,
                  answer: { code: q.code, doneDate: new Date() },
                };
                const found = answers.find(x => x.code === q.code);
                if (found) {
                  d.answer = found;
                }
                return d;
              }),
          };

          rv.doneCount = rv.details.reduce((a, item) => a + (item.answer.done ? 1 : 0), 0);

          // Images do not have an answer
          rv.totalCount = rv.details.reduce((a, item) => a + (item.question.type !== 'img' ? 1 : 0), 0);

          rv.verifiedCount = rv.details.reduce((a, item) => a + (item.answer.verified ? 1 : 0), 0);
          rv.show = rv.doneCount != rv.totalCount;
          return rv;
        });
      })
    );
  }

  ngOnInit() {
    this.sub = this.route.paramMap.subscribe(params => (this.questionsService.group = params.get('id')));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
  public updateDone(detail: Detail, value: boolean) {
    const answer = detail.answer;
    answer.done = value;
    answer.doneDate = new Date();
    this.answerService.updateAnswer(answer);
  }
  public updateText(detail: Detail, event: FocusEvent) {
    const target = event.target as HTMLInputElement;
    const answer = detail.answer;
    answer.text = target.value;
    answer.done = Boolean(target.value);
    this.answerService.updateAnswer(answer);
  }

  public updateVerify(id: string, value: boolean) {
    this.answerService.updateVerify(id, value);
  }

  public print() {
    if (this.result) {
      const DATA = this.result.nativeElement;
      html2canvas(DATA).then(canvas => {
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

  uploadProof(detail: Detail) {
    const param: UploadParameters = {
      directory: `upload/${this.answerService.userId}`,
    };

    const dialogRef = this.dialog.open(DialogUploadComponent, {
      data: param,
    });

    dialogRef.afterClosed().subscribe((result: UploadResult) => {
      detail.answer.proof = result.filenames[0];
      detail.answer.done = true;
      detail.answer.doneDate = new Date();
      this.answerService.updateAnswer(detail.answer);
    });
  }

  viewProof(detail: Detail) {
    const param: DialogViewOptions = {
      // filename: `upload/${this.answerService.userId}/${detail.answer.proof}`,
      filename: detail.answer.proof || '',
    };

    this.dialog.open(DialogViewComponent, {
      data: param,
    });
  }
}
