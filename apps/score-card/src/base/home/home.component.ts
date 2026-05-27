import { AsyncPipe, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { User } from '@angular/fire/auth';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { saveAs } from 'file-saver';
import { combineLatest, map, Observable, Subscription } from 'rxjs';
import { Answer, LevelCode, Question, QuestionGroup, UploadParameters } from '../../definitions';
import { DialogGroupComponent, DialogUploadComponent } from '../../dialog';
import { AnswersService, AuthService, QuestionsService, UsersService } from '../../service';

interface LevelCard {
  level: LevelCode;
  label: string;
  totalCount: number;
  doneCount: number;
  percentage: number;
}

interface GroupCard {
  group: QuestionGroup;
  totalCount: number;
  doneCount: number;
  verifiedCount: number;
  percentage: number | null;
  levels: LevelCard[];
}

const levelOrder: LevelCode[] = ['safe', 'trained', 'assist', 'guide', 'assessor'];
const levelLabels: Record<LevelCode, string> = {
  safe: 'Safe Participant',
  trained: 'Trained Participant',
  assist: 'Assistant Guide',
  guide: 'Guide',
  assessor: 'Assessor',
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatSlideToggleModule, MatButtonToggleModule, MatButtonModule, MatCardModule, MatToolbarModule, NgClass, AsyncPipe, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnDestroy {
  public groups$: Observable<QuestionGroup[]>;
  public groupCards$: Observable<GroupCard[]>;
  public selectedGroup$: Observable<QuestionGroup>;
  public login$: Observable<User | null>;

  public groupId?: string;

  public isEdit = false;
  public isVerify = false;

  public newGroup = '';
  private userSubscription?: Subscription;

  constructor(
    public questionsService: QuestionsService,
    private answersService: AnswersService,
    private usersService: UsersService,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    this.login$ = this.authService.user$;
    this.groups$ = questionsService.allQuestionGroups$;
    this.selectedGroup$ = questionsService.selectedGroup$;
    this.groupCards$ = combineLatest([this.groups$, questionsService.allQuestions$, this.answersService.answers$]).pipe(
      map(([groups, questions, answers]) => groups.map(group => this.toGroupCard(group, questions, answers)))
    );

    this.answersService.userId = this.usersService.userId;
    this.userSubscription = this.usersService.currentUser$.subscribe(user => {
      this.answersService.userId = user?.scoutNumber || this.usersService.userId;
    });
  }

  public ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

  public async click(group: QuestionGroup) {
    this.questionsService.group = group.id;
    this.groupId = group.id;

    if (this.isEdit) {
      await this.router.navigate(['edit', group.id]);
    } else if (this.isVerify) {
      await this.router.navigate(['verify', group.id]);
    } else {
      await this.router.navigate(['check', group.id]);
    }
  }

  public verify(value: boolean) {
    this.isVerify = value;
    if (value) {
      this.isEdit = false;
    }
  }

  public edit(value: boolean) {
    this.isEdit = value;
    if (value) {
      this.isVerify = false;
    }
  }

  public addNewGroup() {
    const group: QuestionGroup = {
      name: '',
      id: '',
      books: {},
      pages: [],
    };
    this.editGroupDetail(group);
  }

  public editGroupDetail(group: QuestionGroup) {
    const dialogRef = this.dialog.open(DialogGroupComponent, {
      data: {
        group,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.id) {
        this.router.navigate(['edit', this.questionsService.group]);
      } else {
        console.info({ result });
      }
    });
  }

  upload() {
    const param: UploadParameters = {
      directory: 'upload',
    };

    const dialogRef = this.dialog.open(DialogUploadComponent, {
      data: param,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.info({ result });
    });
  }

  getLog() {
    this.http.get('/Adventurous activities Log Book Template Scouts.xlsx', { responseType: 'blob' }).subscribe(blob => {
      saveAs(blob, 'Adventurous activities Log Book Template Scouts.xlsx');
    });
  }

  private toGroupCard(group: QuestionGroup, questions: Question[], answers: Answer[]): GroupCard {
    const levels = this.toLevelCards(group, questions, answers);
    const totalCount = levels.reduce((total, level) => total + level.totalCount, 0);
    const doneCount = levels.reduce((total, level) => total + level.doneCount, 0);
    const questionCodes = new Set(group.pages.flatMap(page => page.questions));
    const answerableQuestionCodes = new Set(
      [...questionCodes]
        .map(code => questions.find(question => question.code === code))
        .filter((question): question is Question => Boolean(question))
        .filter(question => question.type !== 'img')
        .map(question => question.code)
    );

    const verifiedCount = [...answerableQuestionCodes].reduce((total, code) => {
      const answer = answers.find(item => item.code === code);
      return total + (answer?.verified ? 1 : 0);
    }, 0);

    return {
      group,
      totalCount,
      doneCount,
      verifiedCount,
      percentage: totalCount ? Math.round((doneCount / totalCount) * 100) : null,
      levels,
    };
  }

  private toLevelCards(group: QuestionGroup, questions: Question[], answers: Answer[]): LevelCard[] {
    const rawLevels = levelOrder
      .map(level => {
        const codes = new Set(group.pages.filter(page => page.level === level).flatMap(page => page.questions));
        const answerableQuestions = [...codes]
          .map(code => questions.find(question => question.code === code))
          .filter((question): question is Question => Boolean(question))
          .filter(question => question.type !== 'img');
        const doneCount = answerableQuestions.reduce((total, question) => {
          const answer = answers.find(item => item.code === question.code);
          return total + (answer?.done ? 1 : 0);
        }, 0);

        return {
          level,
          label: levelLabels[level],
          totalCount: answerableQuestions.length,
          doneCount,
          percentage: answerableQuestions.length ? Math.round((doneCount / answerableQuestions.length) * 100) : 0,
        };
      })
      .filter(level => level.totalCount > 0);

    return rawLevels.filter((level, index) => !(level.percentage === 100 && rawLevels[index + 1]?.percentage === 100));
  }
}
