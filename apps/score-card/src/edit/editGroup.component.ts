import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { PageDisplay, question, questionGroup } from '../definitions';
import { QuestionsService } from '../service/questions.service';

@Component({
  selector: 'app-edit-group',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './editGroup.component.html',
  styleUrl: './editGroup.component.css',
})
export class EditGroupComponent {
  private groupId: number = 0;

  @Input()
  public set id(value: string) {
    this.groupId = Number(value);
    this.questionsService.group = Number(value);
  }
  public get id(): string {
    return this.groupId.toString();
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

    this.questionsService.saveGroup(this.groupId, event.previousContainer.data);
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

  public addGroup() {}
}
