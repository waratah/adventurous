import { Component, effect, model } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageDisplay } from '../definitions';
import { MyErrorStateMatcher } from '../user/user-new/user-new.component';

@Component({
  selector: 'app-section-detail',
  imports: [
    FormsModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './section-detail.component.html',
  styleUrl: './section-detail.component.css',
})
export class SectionDetailComponent {
  /** Section to be edited or a new section to be populated */
  section = model<PageDisplay>();

  level = '';

  sectionForm: FormGroup;

  private headingFormControl = new FormControl('', [Validators.required]);
  private descriptionFormControl = new FormControl('');

  matcher = new MyErrorStateMatcher();

  constructor() {
    effect(() => {
      const q = this.section();
      if (!q) {
        this.headingFormControl.setValue('');
        this.level = '';
        return;
      }
      this.level = q.level || '';
      this.headingFormControl.setValue(q?.heading || '');
      this.descriptionFormControl.setValue(q?.description || '');
    });

    this.sectionForm = new FormGroup({
      heading: this.headingFormControl,
      description: this.descriptionFormControl,
    });
  }

  save() {
    if (this.sectionForm.invalid) {
      return;
    }

    const u = this.section();

    if (u) {
      const result = <PageDisplay>{
        ...u,
        level: this.level || '',
        heading: this.headingFormControl.getRawValue() || undefined,
      };
      this.section.set(result);
    } else {
      const result = <PageDisplay>{
        level: this.level || '',
        heading: this.headingFormControl.getRawValue() || undefined,
        description: this.descriptionFormControl.getRawValue() || undefined,
        questions: [],
      };
      this.section.set(result);
      console.log(this.section());
    }
  }
}
