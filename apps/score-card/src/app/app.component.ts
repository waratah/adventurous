import { Component, OnDestroy, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from '@angular/fire/auth';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthClaims, QuestionGroup } from '../definitions';
import { AuthService, QuestionsService, UsersService } from '../service';

@Component({
  imports: [RouterModule, MatButtonToggleModule, MatToolbarModule, MatTooltipModule, MatIconModule, MatMenuModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnDestroy {
  public login: Signal<User | null | undefined>;
  public groups: Signal<QuestionGroup[] | undefined>;
  public selectedGroup: Signal<QuestionGroup | undefined>;
  public id: Signal<string | undefined>;
  public claims = signal<AuthClaims>({ scoutNumber: '', isAdmin: false, isVerify: false });

  public action = 'view';
  public title = 'Adventurous Activities';

  private sub: Subscription;
  private firstTime = true;

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
    this.sub = this.authService.user$.subscribe(() => {
      if (this.firstTime) {
        this.firstTime = false;
        this.authService.authClaims().then(claim => {
          this.userService.userId = claim.scoutNumber;
          this.claims.set(claim);
        });
      } else {
        this.authService.authClaims().then(claim => this.claims.set(claim));
      }
    });
    this.login = toSignal(this.authService.user$);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  public async gotoGroup(group: QuestionGroup) {
    this.questionsService.group = group.id;
    await this.router.navigate([this.action, group.id]);
  }

  public async changeAction(action: string) {
    this.action = action;
    if (this.questionsService.group) {
      await this.router.navigate([action, this.questionsService.group]);
    }
  }

  public logout() {
    this.authService.logout().then(async () => await this.router.navigate(['login']));
  }
}
