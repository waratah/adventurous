import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PageDisplay } from '../../definitions';
import { MyErrorStateMatcher } from '../../utils';

@Component({
  selector: 'app-dialog-section',
  imports: [
    CdkTextareaAutosize,
    TextFieldModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    ReactiveFormsModule,
  ],
  templateUrl: './dialog-section.component.html',
  styleUrl: './dialog-section.component.css',
})
export class DialogSectionComponent {
  /** Section to be edited or a new section to be populated */
  section?: PageDisplay;

  level = '';
  requiresSignOff = false;
  sectionForm: FormGroup;

  private headingFormControl = new FormControl('', [Validators.required]);
  private descriptionFormControl = new FormControl('');

  matcher = new MyErrorStateMatcher();

  constructor(@Inject(MAT_DIALOG_DATA) data: { section: PageDisplay }, private dialogRef: MatDialogRef<DialogSectionComponent>) {
    this.section = data.section;
    if (!this.section) {
      this.headingFormControl.setValue('');
      this.level = '';
    } else {
      this.level = this.section.level || '';
      if (!this.level && this.section.heading) {
        const heading = this.section.heading.toLocaleLowerCase();

        // convert headings to levels it they match
        ['safe', 'trained'].forEach(l => {
          if (!heading.localeCompare(l)) {
            this.level = l;
          }
        });
      }
      this.headingFormControl.setValue(this.section?.heading || '');
      this.descriptionFormControl.setValue(this.section?.description || '');
      this.requiresSignOff = this.section.requiresSignOff;
    }
    this.sectionForm = new FormGroup({
      heading: this.headingFormControl,
      description: this.descriptionFormControl,
    });
  }

  save() {
    if (this.sectionForm.invalid) {
      return;
    }

    let result: PageDisplay | undefined = undefined;
    if (this.section) {
      result = <PageDisplay>{
        ...this.section,
        level: this.level || '',
        heading: this.headingFormControl.getRawValue() || undefined,
        description: this.descriptionFormControl.getRawValue() || undefined,
        requiresSignOff: this.requiresSignOff,
      };
    } else {
      result = <PageDisplay>{
        level: this.level || '',
        heading: this.headingFormControl.getRawValue() || undefined,
        description: this.descriptionFormControl.getRawValue() || undefined,
        requiresSignOff: this.requiresSignOff,
        questions: [],
      };
    }
    this.dialogRef.close(result);
  }
}
