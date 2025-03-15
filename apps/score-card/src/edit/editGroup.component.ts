import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { AsyncPipe, NgClass } from '@angular/common';
import { Component, Input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Observable } from 'rxjs';
import { PageDisplay, question, questionGroup } from '../definitions';
import { QuestionsService } from '../service/questions.service';
import { CollapseComponent } from '../utils/collapse/collapse.component';
import { SectionDetailComponent } from './section-detail.component';
import { QuestionDetailComponent } from './question-detail.component';

@Component({
  selector: 'app-edit-group',
  standalone: true,
  imports: [
    DragDropModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    QuestionDetailComponent,
    CollapseComponent,
    SectionDetailComponent,
    AsyncPipe,
    NgClass,
    FormsModule,
  ],
  templateUrl: './editGroup.component.html',
  styleUrl: './editGroup.component.css',
})
export class EditGroupComponent {
  public groupName = model<string>('');
  public isAddSection = model(false);

  public selectedSection = model<PageDisplay>();

  @Input()
  public set id(value: string) {
    this.questionsService.group = value;
  }

  public questions$: Observable<PageDisplay[]>;
  public groups$: Observable<questionGroup[]>;

  public newQuestion = model<question>();

  constructor(private questionsService: QuestionsService) {
    this.questions$ = questionsService.questions$;
    this.groups$ = questionsService.allQuestionGroups$;

    this.selectedSection.subscribe((value) => {
      if (value?.edit) {
        console.log({ value });
        console.log('Edit');
      } else {
        console.log({ value });
        console.log('Save');
      }
    });
  }

  public dropHeading(event: CdkDragDrop<PageDisplay[]>) {
    moveItemInArray(
      event.previousContainer.data,
      event.previousIndex,
      event.currentIndex
    );

    this.questionsService.saveGroup(
      this.questionsService.group,
      this.groupName(),
      event.previousContainer.data
    );
  }

  public dragMoved(event: any) {
    console.log(event);
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

  editSection(page: PageDisplay, index: number) {
    console.log({ page, index });
    page.edit = true;
    this.selectedSection.set(page);
  }
/*
  public save() {
    console.log('Saving');
    this.isAddGroup.set(false);
  }
*/

  public showAdd() {
    this.selectedSection.set({
      heading: '',
      level: '',
      questions: [],
    });
    this.isAddSection.set(true);

    setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 500);
  }
}
