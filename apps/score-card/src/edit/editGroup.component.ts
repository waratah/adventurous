import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Observable } from 'rxjs';
import { PageDisplay, question, questionGroup } from '../definitions';
import { QuestionsService } from '../service/questions.service';
import { CollapseComponent } from '../utils/collapse/collapse.component';
import { QuestionDetailComponent } from './question-detail.component';
import { GroupDetailComponent } from "./group-detail.component";
import { AsyncPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-edit-group',
  standalone: true,
  imports: [
    DragDropModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    QuestionDetailComponent,
    CollapseComponent,
    GroupDetailComponent,
    AsyncPipe,
    NgClass,
],
  templateUrl: './editGroup.component.html',
  styleUrl: './editGroup.component.css',
})
export class EditGroupComponent {
  public groupName = '';

  public current?: PageDisplay;

  @Input()
  public set id(value: string) {
    this.questionsService.group = value;
  }

  public questions$: Observable<PageDisplay[]>;
  public groups$: Observable<questionGroup[]>;

  constructor(private questionsService: QuestionsService) {
    this.questions$ = questionsService.questions$;
    this.groups$ = questionsService.allQuestionGroups$;
  }

  public dropHeading(event: CdkDragDrop<PageDisplay[]>) {
    moveItemInArray(
      event.previousContainer.data,
      event.previousIndex,
      event.currentIndex
    );

    this.questionsService.saveGroup(
      this.questionsService.group,
      this.groupName,
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
    this.questionsService.createGroup(this.groupName);
  }

  editGroup( page: PageDisplay, index: number ) {
    console.log('editing')
    console.log({ page, index})
    this.current = page;
    page.edit = true;
  }

  public save() {
    console.log('Saveing')
  }
}
