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
  public groupName = signal<string>('');
  public isAddSection = signal(false);

  public selectedSection = signal<PageDisplay | undefined>(undefined);

  public id = input<string>();

  public questions$: Observable<PageDisplay[]>;
  public groups$: Observable<questionGroup[]>;

  public newQuestion = model<question>();

  constructor(private questionsService: QuestionsService) {
    this.questions$ = questionsService.questions$;
    this.groups$ = questionsService.allQuestionGroups$;

    effect(() => (this.questionsService.group = this.id()));

    effect(() => {
      const value = this.selectedSection();
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

  editSection(page: PageDisplay, index: number, sections: PageDisplay[]) {
    // one section at once,  not working too hard on this one...
    sections.forEach((g) => (g.edit = false));

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

  public showAdd(sections: PageDisplay[]) {
    // Todo - isolate te group details...
    sections.forEach((g) => (g.edit = false));

    this.selectedSection.set({
      edit: true,
      heading: '',
      level: '',
      questions: [],
    });
    this.isAddSection.set(true);

    // only works because it is at bottom of screen ...  good enough. TODO:
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 500);
  }
}
