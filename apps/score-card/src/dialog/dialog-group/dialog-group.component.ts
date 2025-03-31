import { Component, Inject, model } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { questionGroup } from '../../definitions';
import { QuestionsService } from '../../service/questions.service';
import { MyErrorStateMatcher } from '../../user/user-new/user-new.component';

@Component({
  selector: 'app-dialog-group',
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './dialog-group.component.html',
  styleUrl: './dialog-group.component.css',
})
export class DialogGroupComponent {
  group = model<questionGroup>();
  groupForm: FormGroup;
  private nameFormControl = new FormControl('', [Validators.required]);

  hasSafe = false;
  private safeNameFormControl = new FormControl('', [Validators.required]);
  private safeHeadingFormControl = new FormControl('', [Validators.required]);
  private safeFootingFormControl = new FormControl('', [Validators.required]);

  hasTrained = false;
  private trainedNameFormControl = new FormControl('', [Validators.required]);
  private trainedHeadingFormControl = new FormControl('', [
    Validators.required,
  ]);
  private trainedFootingFormControl = new FormControl('', [
    Validators.required,
  ]);

  matcher = new MyErrorStateMatcher();

  constructor(
    private questionService: QuestionsService,
    @Inject(MAT_DIALOG_DATA) private data: { group: questionGroup },
    private dialogRef: MatDialogRef<DialogGroupComponent>
  ) {
    const group = data.group;
    if (!group.books) {
      group.books = {};
    }
    this.group.set(group);

    this.nameFormControl.setValue(group.name);
    if (group.books.safe) {
      this.hasSafe = true;
      this.safeNameFormControl.setValue(group.books.safe.name);
      this.safeHeadingFormControl.setValue(group.books.safe.heading);
      this.safeFootingFormControl.setValue(group.books.safe.footing);
    }
    if (group.books.trained) {
      this.hasTrained = true;
      this.trainedNameFormControl.setValue(group.books.trained.name);
      this.trainedHeadingFormControl.setValue(group.books.trained.heading);
      this.trainedFootingFormControl.setValue(group.books.trained.footing);
    }

    this.groupForm = new FormGroup({
      name: this.nameFormControl,
    });

    this.setSafe(this.hasSafe);
    this.setTrained(this.hasTrained);
  }

  setSafe(value: boolean) {
    this.hasSafe = value;
    if (value) {
      this.groupForm.addControl('safeName', this.safeNameFormControl);
      this.groupForm.addControl('safeHeading', this.safeHeadingFormControl);
      this.groupForm.addControl('safeFooting', this.safeFootingFormControl);
    } else {
      this.groupForm.removeControl('safeName');
      this.groupForm.removeControl('safeHeading');
      this.groupForm.removeControl('safeFooting');
    }
  }

  setTrained(value: boolean) {
    this.hasTrained = value;
    if (value) {
      this.groupForm.addControl('trainedName', this.trainedNameFormControl);
      this.groupForm.addControl(
        'trainedHeading',
        this.trainedHeadingFormControl
      );
      this.groupForm.addControl(
        'trainedFooting',
        this.trainedFootingFormControl
      );
    } else {
      this.groupForm.removeControl('trainedName');
      this.groupForm.removeControl('trainedHeading');
      this.groupForm.removeControl('trainedFooting');
    }
  }

  async save() {
    if (this.groupForm.invalid) {
      return;
    }
    const g = this.group();
    if (g) {
      const result: questionGroup = {
        ...g,
        name: this.nameFormControl.getRawValue() || '',
      };

      if (this.hasSafe) {
        const sb = result.books.safe || { name: '', heading: '', footing: '' };
        sb.name = this.safeNameFormControl.getRawValue() || '';
        sb.heading = this.safeHeadingFormControl.getRawValue() || '';
        sb.footing = this.safeFootingFormControl.getRawValue() || '';
        result.books.safe = sb;
      }

      if (this.hasTrained) {
        const tb = result.books.trained || {
          name: '',
          heading: '',
          footing: '',
        };
        tb.name = this.trainedNameFormControl.getRawValue() || '';
        tb.heading = this.trainedHeadingFormControl.getRawValue() || '';
        tb.footing = this.trainedFootingFormControl.getRawValue() || '';
        result.books.trained = tb;
      }

      await this.questionService
        .updateGroup(result)
        .catch((error) => console.error(error));

      this.dialogRef.close(result);
    }
  }
}
