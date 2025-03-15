import { Component, effect, model } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { question } from '../definitions';
import { QuestionsService } from '../service/questions.service';
import { MyErrorStateMatcher } from '../user/user-new/user-new.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-question-detail',
  imports: [
    FormsModule,
    MatButtonToggleModule,
    MatCheckboxModule,
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
  controlType = model('');
  attachmentRequired = false;

  textFormControl = new FormControl('', [Validators.required]);
  imgFormControl = new FormControl('', [Validators.required]);
  urlFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(
      /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()[\]{};:'".,<>?«»“”‘’]))/i
    ),
  ]);

  matcher = new MyErrorStateMatcher();

  constructor(public questionService: QuestionsService) {
    effect(() => {
      const q = this.question();
      if (q) {
        this.textFormControl.setValue(q.text);
        this.urlFormControl.setValue(q.url || ' ');
        this.controlType.set(q.type || '');
        this.attachmentRequired = q.attachmentRequired || false;
      }
    });
  }

  setControlType(value: string) {
    this.controlType.set(value);
  }

  save() {
    const u = this.question();

    const result = <question>{
      code: u?.code || '',
      text: this.textFormControl.getRawValue() || '',
      url: this.urlFormControl.getRawValue() || undefined,
      img: this.imgFormControl.getRawValue() || undefined,
      attachmentRequired: this.attachmentRequired,
      type: this.controlType(),
    };

    this.questionService.updateQuestion(result);
  }
}
