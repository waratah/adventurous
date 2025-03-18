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
import { PageDisplay, question, questionGroup } from '../definitions';
import { QuestionsService } from '../service/questions.service';
import { CollapseComponent } from '../utils/collapse/collapse.component';
import { DialogQuestionComponent } from './dialog-question.component';
import { DialogSectionComponent } from './dialog-section.component';
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
  ],
  templateUrl: './editGroup.component.html',
  styleUrl: './editGroup.component.css',
})
export class EditGroupComponent {
  public groupName = signal<string>('');
  public isAddSection = signal(false);

  public selectedSection = signal<PageDisplay | undefined>(undefined);

  public id = input<string>();

  public questions$: Observable<PageDisplay[]>;
  public groups$: Observable<questionGroup[]>;

  public newQuestion = model<question>();

  constructor(
    private questionsService: QuestionsService,
    private dialog: MatDialog
  ) {
    this.questions$ = questionsService.questions$;
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

  public dragMoved(event: any) {
    console.log(event);
  }

  editQuestion(question: question) {
    this.dialog.open(DialogQuestionComponent, {
      data: {
        question,
      },
    });
  }

  addQuestion(section: PageDisplay, sections: PageDisplay[]) {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      data: <question>{
        code: '',
        text: '',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`question Dialog result: `);
      console.log({ result });
      if (result) {
        const newQuestions = [...section.questions, result];
        section.questions = newQuestions;
        this.questionsService.saveGroup(this.id() || '', sections);
      } else {
        console.error('result missing from question dialog');
      }
    });
  }

  public dropQuestion(event: CdkDragDrop<question[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.previousContainer.data,
        event.previousIndex,
        event.currentIndex
      );

      // this.questionsService.saveGroup(
      //   this.groupId,
      //   event.previousContainer.data
      // );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
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
