import { Component, model } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageDisplay } from '../definitions';
import { MyErrorStateMatcher } from '../user/user-new/user-new.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

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

  level = model('');

  headingFormControl = new FormControl('', [Validators.required]);

  matcher = new MyErrorStateMatcher();

  constructor() {
    this.section.subscribe((q) => {
      if (!q) {
        this.headingFormControl.setValue('');
        this.level.set('');
        return;
      }
      this.level.set(q.level || '');
      if (!this.level() && q.heading) {
        const heading = q.heading.toLocaleLowerCase();

        // convert headings to levels it they match
        ['safe', 'trained'].forEach((l) => {
          if (!heading.localeCompare(l)) {
            this.level.set(l);
          }
        });
      }
      this.headingFormControl.setValue(q?.heading || '');
    });
  }

  save() {
    const u = this.section();

    if (u) {
      const result = <PageDisplay>{
        ...u,
        level: this.level() || '',
        heading: this.headingFormControl.getRawValue() || undefined,
      };
      delete result.edit;
      this.section.set(result);
    } else {
      const result = <PageDisplay>{
        level: this.level() || '',
        heading: this.headingFormControl.getRawValue() || undefined,
        questions: [],
      };
      console.log({ result });
      this.section.set(result);
      console.log(this.section());
    }
  }
}
