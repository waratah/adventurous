import { AsyncPipe, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { User } from '@angular/fire/auth';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { saveAs } from 'file-saver';
import { Observable } from 'rxjs';
import { QuestionGroup, UploadParameters } from '../definitions';
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
  public groups$: Observable<QuestionGroup[]>;
  public selectedGroup$: Observable<QuestionGroup>;
  public login$: Observable<User | null>;

  public groupId?: string;

  public isEdit = false;
  public isVerify = false;

  public newGroup = '';

  constructor(
    private questionsService: QuestionsService,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    this.login$ = this.authService.user$;
    this.groups$ = questionsService.allQuestionGroups$;
    this.selectedGroup$ = questionsService.selectedGroup$;
  }

  public async click(group: QuestionGroup) {
    this.questionsService.group = group.id;
    this.groupId = group.id;

    if (this.isEdit) {
      await this.router.navigate(['edit', group.id]);
    } else if (this.isVerify) {
      await this.router.navigate(['verify', group.id]);
    } else {
      await this.router.navigate(['check', group.id]);
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
    const group: QuestionGroup = {
      name: '',
      id: '',
      books: {},
      pages: [],
    };
    this.editGroupDetail(group);
  }

  public editGroupDetail(group: QuestionGroup) {
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
      console.info({ result });
    });
  }

  getLog() {
    this.http.get('/Adventurous activities Log Book Template Scouts.xlsx', { responseType: 'blob' }).subscribe(blob => {
      saveAs(blob, 'Adventurous activities Log Book Template Scouts.xlsx');
    });
  }
}
