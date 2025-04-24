import { Component, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from '@angular/fire/auth';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { QuestionGroup } from '../definitions';
import { AuthService, QuestionsService, UsersService } from '../service';

@Component({
  imports: [RouterModule, MatButtonToggleModule, MatToolbarModule, MatTooltipModule, MatIconModule, MatMenuModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public login: Signal<User | null | undefined>;

  public groups: Signal<QuestionGroup[] | undefined>;
  public selectedGroup: Signal<QuestionGroup | undefined>;
  public id: Signal<string | undefined>;

  public action = 'view';
  public title = 'Adventurous Activities';

  constructor(
    private questionsService: QuestionsService,
    private authService: AuthService,
    private userService: UsersService,
    private router: Router
  ) {
    this.groups = toSignal(questionsService.allQuestionGroups$);
    this.selectedGroup = toSignal(questionsService.selectedGroup$);
    this.id = toSignal(this.questionsService.groupId$);

    // test user on startup only...
    this.authService.user$.pipe(take(1)).subscribe(u => {
      this.userService.loadUID(u?.uid);
      this.authService.displayClaims();


    });
    this.login = toSignal(this.authService.user$);
  }

  public gotoGroup(group: QuestionGroup) {
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
