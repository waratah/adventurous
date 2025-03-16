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
import { question, questionType } from '../definitions';
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
  controlType = model<questionType>();
  attachmentRequired = false;

  // Form declarations
  questionForm: FormGroup;
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
      const ct = this.controlType();

      this.questionForm.removeControl('url');

      switch (ct) {
        case 'url':
          this.questionForm.addControl('url', this.urlFormControl);
          break;

        case 'img':
          this.questionForm.addControl('img', this.imgFormControl);
          break;

        case 'checkbox':
        case 'textbox':
          break;
      }
    });

    effect(() => {
      const q = this.question();
      if (q) {
        this.textFormControl.setValue(q.text);
        this.urlFormControl.setValue(q.url || ' ');
        this.controlType.set(q.type || '');
        this.attachmentRequired = q.attachmentRequired || false;
      }
    });

    this.questionForm = new FormGroup({
      text: this.textFormControl,
      image: this.imgFormControl,
      url: this.urlFormControl,
    });
  }

  setControlType(value: questionType) {
    this.controlType.set(value);
  }

  save() {
    if (this.questionForm.invalid) {
      return;
    }
    const u = this.question();

    const result = <question>{
      ...u,
      text: this.textFormControl.getRawValue() || '',
      url: this.urlFormControl.getRawValue() || undefined,
      img: this.imgFormControl.getRawValue() || undefined,
      attachmentRequired: this.attachmentRequired,
      type: this.controlType(),
    };

    this.questionService.updateQuestion(result);
  }
}
