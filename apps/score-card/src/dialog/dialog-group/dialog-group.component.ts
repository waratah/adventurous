import { Component, effect, Inject, model, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbar } from '@angular/material/toolbar';
import { LevelCode, QuestionGroup } from '../../definitions';
import { QuestionsService } from '../../service';
import { LevelSelectComponent, MyErrorStateMatcher } from '../../utils';

@Component({
  selector: 'app-dialog-group',
  imports: [
    LevelSelectComponent,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbar,
    ReactiveFormsModule,
  ],
  templateUrl: './dialog-group.component.html',
  styleUrl: './dialog-group.component.css',
})
export class DialogGroupComponent {
  group = model<QuestionGroup>();
  level = signal<LevelCode>('safe');

  oldLevel: LevelCode = 'safe';

  groupForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    level: new FormControl('safe', [Validators.required]),
    levelName: new FormControl('', [Validators.required]),
    heading: new FormControl('', [Validators.required]),
    footing: new FormControl('', [Validators.required]),
  });

  matcher = new MyErrorStateMatcher();

  constructor(
    private questionService: QuestionsService,
    @Inject(MAT_DIALOG_DATA) private data: { group: QuestionGroup },
    private dialogRef: MatDialogRef<DialogGroupComponent>
  ) {
    const group = data.group;
    if (!group.books) {
      group.books = {};
    }
    this.group.set(group);
    this.groupForm.controls['name'].setValue(group.name);

    effect(() => {
      this.changeLevel(this.level());
    });
  }

  async save() {
    if (this.groupForm.invalid) {
      return;
    }
    const g = this.group();
    if (g) {
      const result: QuestionGroup = {
        ...g,
        name: this.groupForm.controls['name'].getRawValue() || '',
      };

      this.changeLevel(this.level());

      await this.questionService.updateGroup(result).catch(error => console.error(error));

      this.dialogRef.close(result);
    }
  }

  changeLevel(text: string) {
    const l = text as LevelCode;
    let book = this.data.group.books[this.oldLevel];
    const name = this.groupForm.controls['levelName'].value;
    const heading = this.groupForm.controls['heading'].value;
    const footing = this.groupForm.controls['footing'].value;
    if (name || heading || footing) {
      if (!book) {
        book = {
          name,
          heading,
          footing,
        };
        this.data.group.books[this.oldLevel] = book;
        this.group.set(this.data.group);
      } else {
        // Hack to remove old heading...
        const temp: any = book;
        delete temp.header;

        book.name = name || book.name;
        book.heading = heading || book.heading;
        book.footing = footing || book.footing;
      }
    }

    this.oldLevel = l;


    book = this.data.group.books[l];

    this.groupForm.controls['levelName'].setValue(book?.name || '');
    this.groupForm.controls['heading'].setValue(book?.heading || '');
    this.groupForm.controls['footing'].setValue(book?.footing || '');
  }
}
