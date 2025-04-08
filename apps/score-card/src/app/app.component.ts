import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, signal } from '@angular/core';
import { User } from '@angular/fire/auth';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { Observable, Subscription, take } from 'rxjs';
import { questionGroup } from '../definitions';
import { AuthService } from '../service/auth.service';
import { QuestionsService } from '../service/questions.service';
import { UsersService } from '../service';

@Component({
  imports: [AsyncPipe, RouterModule, MatButtonToggleModule, MatToolbarModule, MatTooltipModule, MatIconModule, MatMenuModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnDestroy {
  public login$: Observable<User | null>;

  public groups$: Observable<questionGroup[]>;
  public selectedGroup$: Observable<questionGroup>;
  public id = signal('');

  public action = 'view';
  public title = 'Adventurous Activities';

  private sub: Subscription;

  constructor(
    private questionsService: QuestionsService,
    private authService: AuthService,
    private userService: UsersService,
    private router: Router
  ) {
    this.login$ = this.authService.user$;
    this.groups$ = questionsService.allQuestionGroups$;
    this.selectedGroup$ = questionsService.selectedGroup$;
    this.sub = this.questionsService.groupId$.subscribe(i => this.id.set(i));

    this.login$.pipe(take(1)).subscribe(u => {
      if (u?.email) {
        this.userService.loadEmail(u?.email);
      }
    });
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

  public logout() {
    this.authService.logout().then(() => this.router.navigate(['login']));
  }
}
