import { Component, model, effect } from '@angular/core';
import {
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { question } from '../definitions';
import { QuestionsService } from '../service/questions.service';
import { MyErrorStateMatcher } from '../user/user-new/user-new.component';
@Component({
  selector: 'app-question-detail',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './question-detail.component.html',
  styleUrl: './question-detail.component.css',
})
export class QuestionDetailComponent {
  question = model<question>();

  textFormControl = new FormControl('', [Validators.required]);
  urlFormControl = new FormControl('', [
    Validators.pattern(
      /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()[\]{};:'".,<>?«»“”‘’]))/i
    ),
  ]);
  typeFormControl = new FormControl('', []);
  attachmentFormControl = new FormControl('', []);

  matcher = new MyErrorStateMatcher();

  constructor(public questionService: QuestionsService) {
    effect(() => {
      const q = this.question();
      if (q) {
        this.textFormControl.setValue(q.text);
        this.urlFormControl.setValue(q.url || ' ');
        this.typeFormControl.setValue(q.type || '');
        this.attachmentFormControl.setValue(
          (!!q.attachmentRequired).toString()
        );
      }
    });
  }

  save() {
    const u = this.question();

    const result = <question>{
      code: u?.code || '',
      text: this.textFormControl.getRawValue() || '',
      url: this.urlFormControl.getRawValue() || undefined,
      attachmentRequired: (this.attachmentFormControl.getRawValue() || undefined )=== 'true',
      type: this.typeFormControl.getRawValue() || undefined,
    };

    this.questionService.updateQuestion(result);
  }
}
