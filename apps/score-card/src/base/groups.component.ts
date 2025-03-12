import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { questionGroup } from '../definitions';
import { QuestionsService } from '../service/questions.service';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [
    CommonModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatToolbarModule,
  ],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
})
export class GroupsComponent {
  public groups$: Observable<questionGroup[]>;
  public selectedGroup$: Observable<questionGroup>;

  public groupId?: string;

  public isEdit = false;
  public isVerify = false;

  public newGroup = '';

  constructor(
    public questionsService: QuestionsService,
    private router: Router
  ) {
    this.groups$ = questionsService.allQuestionGroups$;
    this.selectedGroup$ = questionsService.selectedGroup$;
  }

  public click(group: questionGroup) {
    this.questionsService.group = group.id;
    this.groupId = group.id;

    if (this.isEdit) {
      this.router.navigate(['edit', group.id]);
    } else if (this.isVerify) {
      this.router.navigate(['verify', group.id]);
    } else {
      this.router.navigate(['check', group.id]);
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

  public changeGroupName(event: any) {
    this.newGroup = event.target.value;
  }

  public createNew() {
    if (this.newGroup) {
      this.questionsService.createGroup(this.newGroup);
    }
  }
}
