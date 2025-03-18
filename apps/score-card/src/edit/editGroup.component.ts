import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { AsyncPipe, NgClass } from '@angular/common';
import { Component, effect, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable } from 'rxjs';
import { PageDisplay, Question, questionGroup } from '../definitions';
import { QuestionsService } from '../service/questions.service';
import { CollapseComponent } from '../utils';
import { DialogQuestionComponent } from './dialog-question.component';
import { DialogSectionComponent } from './dialog-section.component';
import { QuestionSelectComponent } from '../utils/question-select/question-select.component';
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
    MatDialogModule,
    CollapseComponent,
    AsyncPipe,
    NgClass,
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

  public id = input<string>();

  public sections$: Observable<PageDisplay[]>;
  public groups$: Observable<questionGroup[]>;

  constructor(
    private questionsService: QuestionsService,
    private dialog: MatDialog
  ) {
    this.sections$ = questionsService.sections$;
    this.groups$ = questionsService.allQuestionGroups$;

    effect(() => (this.questionsService.group = this.id()));
  }

  public dropHeading(event: CdkDragDrop<PageDisplay[]>) {
    moveItemInArray(
      event.previousContainer.data,
      event.previousIndex,
      event.currentIndex
    );

    this.questionsService.saveGroup(
      this.questionsService.group,
      event.previousContainer.data
    );
  }

  removeQuestion(
    question: Question,
    section: PageDisplay,
    sections: PageDisplay[]
  ) {
    section.questions = section.questions.filter(
      (x) => x.code !== question.code
    );
    this.questionsService.saveGroup(this.id() || '', sections);
  }

  editQuestion(question: Question) {
    this.dialog.open(DialogQuestionComponent, {
      data: {
        question,
      },
    });
  }

  addQuestion(
    question: Question,
    section: PageDisplay,
    sections: PageDisplay[]
  ) {
    if (question) {
      const list = [...section.questions, question];
      section.questions = list;
      this.questionsService.saveGroup(this.id() || '', sections);
    } else {
      console.error('result missing from question dialog');
    }
  }

  newQuestion(section: PageDisplay, sections: PageDisplay[]) {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      data: <Question>{
        code: '',
        text: '',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.addQuestion(result, section, sections);
    });
  }

  public dropSection(event: CdkDragDrop<Question[]>, sections: PageDisplay[]) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.previousContainer.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.questionsService.saveGroup(this.id() || '', sections);
  }

  public addGroup() {
    this.questionsService.createGroup(this.groupName());
  }

  editSection(section: PageDisplay, index: number, sections: PageDisplay[]) {
    const dialogRef = this.dialog.open(DialogSectionComponent, {
      data: {
        section,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        sections[index] = result;

        this.questionsService.saveGroup(this.id() || '', sections);
      } else {
        console.error('result missing from section this.dialog');
      }
    });
  }
  /*
  public save() {
    console.log('Saving');
    this.isAddGroup.set(false);
  }
*/

  public addSection(sections: PageDisplay[]) {
    const dialogRef = this.dialog.open(DialogSectionComponent, {
      data: {
        section: {
          heading: '',
          level: '',
          questions: [],
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        sections.push(result);
        this.questionsService.saveGroup(this.id() || '', sections);
      } else {
        console.error('result missing from section this.dialog');
      }
    });
  }
}
