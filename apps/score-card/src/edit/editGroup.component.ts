import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AsyncPipe } from '@angular/common';
import { Component, effect, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Observable, take } from 'rxjs';
import { PageDisplay, Question, QuestionGroup } from '../definitions';
import {
  ConfirmationOptions,
  DialogConfirmComponent,
  DialogGroupComponent,
  DialogQuestionComponent,
  DialogSectionComponent,
} from '../dialog';
import { QuestionsService } from '../service';
import { CollapseComponent, QuestionSelectComponent } from '../utils';

@Component({
  selector: 'app-edit-group',
  standalone: true,
  imports: [
    DragDropModule,
    MatToolbarModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    CollapseComponent,
    AsyncPipe,
    FormsModule,
    QuestionSelectComponent,
  ],
  templateUrl: './editGroup.component.html',
  styleUrl: './editGroup.component.css',
})
export class EditGroupComponent {
  public groupName = signal<string>('');
  public isAddSection = signal(false);

  public selectedSection = signal<PageDisplay | undefined>(undefined);
  public saveError = signal<string | undefined>(undefined);

  public id = input<string>();

  public sections$: Observable<PageDisplay[]>;
  public groups$: Observable<QuestionGroup[]>;

  constructor(private questionsService: QuestionsService, private dialog: MatDialog, private router: Router) {
    this.sections$ = questionsService.sections$;
    this.groups$ = questionsService.allQuestionGroups$;

    effect(() => (this.questionsService.group = this.id()));
  }

  public dropHeading(event: CdkDragDrop<PageDisplay[]>) {
    moveItemInArray(event.previousContainer.data, event.previousIndex, event.currentIndex);

    this.questionsService.saveGroup(this.questionsService.group, event.previousContainer.data);
  }

  removeQuestion(question: Question, section: PageDisplay, sections: PageDisplay[]) {
    section.questions = section.questions.filter(x => x.code !== question.code);
    this.questionsService.saveGroup(this.id() || '', sections);
  }

  editQuestion(question: Question) {
    this.dialog.open(DialogQuestionComponent, {
      data: {
        question,
      },
    });
  }

  addQuestion(question: Question, section: PageDisplay, sections: PageDisplay[]) {
    if (question) {
      const list = [...section.questions, question];
      section.questions = list;

      this.questionsService.saveGroup(this.id() || '', sections);
    } else {
      console.error('result missing from question dialog');
    }
  }

  public async cloneSection(section: PageDisplay, index: number, sections: PageDisplay[]) {
    const param: ConfirmationOptions = {
      message: `Please confirm you want to clone ${section.heading}`,
      continueText: 'Clone section'
    };

    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: param,
    });

    dialogRef.afterClosed().subscribe(async (result: boolean) => {
      if (result) {
        const questions = section.questions;

        const newSection = { ...section };
        newSection.heading = newSection.heading + ' - 2';
        newSection.questions = [];
        await Promise.all(
          questions.map(q => {
            const result = { ...q };
            result.code = ''; // new question
            newSection.questions.push(result as Question);
            return this.questionsService.updateQuestion(result).catch(error => console.error(error));
          })
        );

        sections.splice(index, 0, newSection);
        this.questionsService.saveGroup(this.id() || '', sections);
      }
    });
  }

  public async deleteSection(section: PageDisplay, index: number, sections: PageDisplay[]) {
    const param: ConfirmationOptions = {
      message: `Please confirm you want to delete ${section.heading}, questions will not be removed`,
      continueText: 'Delete'
    };

    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: param,
    });

    dialogRef.afterClosed().subscribe(async (result: boolean) => {
      if (result) {

        sections.splice(index, 1);
        this.questionsService.saveGroup(this.id() || '', sections);
      }
    });
  }

  newQuestion(section: PageDisplay, sections: PageDisplay[]) {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      data: <Question>{
        code: '',
        text: '',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.addQuestion(result, section, sections);
    });
  }

  public dropSection(event: CdkDragDrop<Question[]>, sections: PageDisplay[]) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.previousContainer.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    this.questionsService.saveGroup(this.id() || '', sections);
  }

  editSection(section: PageDisplay, index: number, sections: PageDisplay[]) {
    const dialogRef = this.dialog.open(DialogSectionComponent, {
      data: {
        section,
      },
      minWidth: 630,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Clone sections so it does not disrupt change checking.
        const ns = [...sections];

        ns[index] = result;

        this.questionsService.saveGroup(this.id() || '', ns);
      } else {
        console.error('result missing from section this.dialog');
      }
    });
  }

  public addSection(sections: PageDisplay[]) {
    const dialogRef = this.dialog.open(DialogSectionComponent, {
      data: {
        section: {
          heading: '',
          level: '',
          questions: [],
        },
      },
      minWidth: 600,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        sections.push(result);
        this.questionsService.saveGroup(this.id() || '', sections);
      } else {
        console.error('result missing from section this.dialog');
      }
    });
  }

  public addGroup() {
    const group: QuestionGroup = {
      name: '',
      id: '',
      books: {},
      pages: [],
    };
    this.editGroupDetail(group);
  }

  editGroup() {
    this.questionsService.selectedGroup$.pipe(take(1)).subscribe(g => this.editGroupDetail(g));
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
      }
    });
  }
}
