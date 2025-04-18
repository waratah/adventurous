import { AsyncPipe, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { questionGroup, UploadParameters } from '../definitions';
import { User } from '@angular/fire/auth';
import { DialogGroupComponent, DialogUploadComponent } from '../dialog';
import { AuthService, QuestionsService } from '../service';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [MatSlideToggleModule, MatButtonToggleModule, MatButtonModule, MatCardModule, MatToolbarModule, NgClass, AsyncPipe, RouterLink],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
})
export class GroupsComponent {
  public groups$: Observable<questionGroup[]>;
  public selectedGroup$: Observable<questionGroup>;
  public login$: Observable<User | null>;

  public groupId?: string;

  public isEdit = false;
  public isVerify = false;

  public newGroup = '';

  constructor(
    public questionsService: QuestionsService,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router
  ) {
    this.login$ = this.authService.user$;
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

  public addNewGroup() {
    const group: questionGroup = {
      name: '',
      id: '',
      books: {},
      pages: [],
    };
    this.editGroupDetail(group);
  }

  public editGroupDetail(group: questionGroup) {
    const dialogRef = this.dialog.open(DialogGroupComponent, {
      data: {
        group,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.id) {
        this.router.navigate(['edit', this.questionsService.group]);
      } else {
        console.info({ result });
      }
    });
  }

  upload() {
    const param: UploadParameters = {
      directory: 'upload',
    };

    const dialogRef = this.dialog.open(DialogUploadComponent, {
      data: param,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log({ result });
    });
  }
}
