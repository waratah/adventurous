import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, signal } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { questionGroup } from '../definitions';
import { QuestionsService } from '../service/questions.service';

@Component({
  imports: [AsyncPipe, RouterModule, MatButtonToggleModule, MatToolbarModule, MatTooltipModule, MatIconModule, MatMenuModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnDestroy {
  public groups$: Observable<questionGroup[]>;
  public selectedGroup$: Observable<questionGroup>;
  public id = signal('');

  public action = 'view';
  public title = 'Adventurous Activities';

  private sub: Subscription;

  constructor(private questionsService: QuestionsService, private router: Router) {
    this.groups$ = questionsService.allQuestionGroups$;
    this.selectedGroup$ = questionsService.selectedGroup$;
    this.sub = this.questionsService.groupId$.subscribe(i => this.id.set(i));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
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
