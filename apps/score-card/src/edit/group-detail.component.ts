import { Component, model } from '@angular/core';
import {
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PageDisplay } from '../definitions';
import { MyErrorStateMatcher } from '../user/user-new/user-new.component';
import { QuestionsService } from '../service/questions.service';

@Component({
  selector: 'app-group-detail',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './group-detail.component.html',
  styleUrl: './group-detail.component.css',
})
export class GroupDetailComponent {
  group = model<PageDisplay>();

  levelFormControl = new FormControl('', [Validators.required]);
  headingFormControl = new FormControl('', [Validators.required]);

  matcher = new MyErrorStateMatcher();

  constructor(private questionService: QuestionsService) {}

  save() {
    const u = this.group();

    if (u) {
      const result = <PageDisplay>{
        ...u,
        level: this.levelFormControl.getRawValue() || '',
        url: this.headingFormControl.getRawValue() || undefined,
      };
      this.group.set(result);
    } else {
      const result = <PageDisplay>{
        level: this.levelFormControl.getRawValue() || '',
        heading: this.headingFormControl.getRawValue() || undefined,
        questions: [],
      };
      this.group.set(result);
    }

    // this.questionService.saveGroup(result);
  }
}
