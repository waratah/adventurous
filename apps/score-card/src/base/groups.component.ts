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
import { DialogGroupComponent } from '../edit/dialog-group/dialog-group.component';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [
    CommonModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatCardModule,
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
    private dialog: MatDialog,
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

      dialogRef.afterClosed().subscribe((result) => {
        if (result?.id) {
          this.router.navigate(['edit', this.questionsService.group]);
        } else {
          console.info({ result });
        }
      });
    }
}
