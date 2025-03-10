import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Observable } from 'rxjs';
import { questionGroup } from '../definitions';
import { QuestionsService } from '../service/questions.service';

@Component({
  imports: [
    AsyncPipe,
    RouterModule,
    MatButtonToggleModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public groups$: Observable<questionGroup[]>;
  public selectedGroup$: Observable<questionGroup>;

  action = 'view';
  title = 'Adventurous Activities';

  constructor(
    public questionsService: QuestionsService,
    private router: Router
  ) {
    this.groups$ = questionsService.allQuestionGroups$;
    this.selectedGroup$ = questionsService.selectedGroup$;
  }

  public gotoGroup(group: questionGroup) {
    this.questionsService.group = group.id;
    this.router.navigate([this.action, group.id]);
  }

  public changeAction(action: string) {
    this.action = action;
    if (this.questionsService.group) {
      this.router.navigate([action, this.questionsService.group]);
    }
  }
}
