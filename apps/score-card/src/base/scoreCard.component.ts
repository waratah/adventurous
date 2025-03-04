import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, Subscription } from 'rxjs';
import { answer, PageDisplay, question, questionGroup } from '../definitions';
import { AnswersService } from '../service/answers.service';
import { QuestionsService } from '../service/questions.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface detail {
  answer: answer;
  question: question;
}

interface detailPage {
  heading: string;
  details: detail[];
  show: boolean;
}

@Component({
  selector: 'app-score-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scoreCard.component.html',
  styleUrl: './scoreCard.component.css',
})
export class ScoreCardComponent {
  @ViewChild('result') result?: ElementRef;

  public isVerify = false;

  @Input()
  public set action(value: string) {
    this.isVerify = value == 'verify';
  }

  public questions$: Observable<PageDisplay[]>;
  public groups$: Observable<questionGroup[]>;
  public detail$: Observable<detailPage[]>;

  private sub?: Subscription;

  constructor(
    public answerService: AnswersService,
    private route: ActivatedRoute,
    private questionsService: QuestionsService
  ) {
    this.questions$ = questionsService.questions$;
    this.groups$ = questionsService.allQuestionGroups$;
    this.detail$ = combineLatest([
      this.questions$,
      this.answerService.answers$,
    ]).pipe(
      map(([questions, answers]) => {
        return questions.map<detailPage>((p) => {
          return <detailPage>{
            heading: p.heading,
            show: true,
            details: p.questions.map((q) => {
              var d = <detail>{
                question: q,
                answer: { code: q.code, doneDate: new Date() },
              };
              var found = answers.find((x) => x.code === q.code);
              if (found) {
                d.answer = found;
              }
              return d;
            }),
          };
        });
      })
    );
  }

  ngOnInit() {
    this.sub = this.route.paramMap.subscribe(
      (params) => (this.questionsService.group = Number(params.get('id')))
    );
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
  public updateDone(id: number, value: boolean) {
    this.answerService.updateAnswer(id, value);
  }

  public updateVerify(id: number, value: boolean) {
    this.answerService.updateVerify(id, value);
  }

  public print() {
    if (this.result) {
      const DATA = this.result.nativeElement;
      html2canvas(DATA).then((canvas) => {
        let fileWidth = 200;
        let fileHeight = (canvas.height * fileWidth) / canvas.width;

        const FILEURI = canvas.toDataURL('image/png');
        let PDF = new jsPDF('p', 'mm', 'a4');
        PDF.addImage(FILEURI, 'PNG', 5, 5, fileWidth, fileHeight);
        PDF.save('angular-demo.pdf');
      });
    } else {
      alert('mismatch with screen and pdf generation');
    }
  }
}
