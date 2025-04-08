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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Question, QuestionType } from '../../definitions';
import { QuestionsService } from '../../service/questions.service';
import { MyErrorStateMatcher } from '../../utils';

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
  question = model<Question>();
  controlType = model<QuestionType>();
  attachmentRequired = false;

  // Form declarations
  questionForm: FormGroup;
  private textFormControl = new FormControl('', [Validators.required]);
  private placeholderFormControl = new FormControl('', [Validators.required]);
  private imgFormControl = new FormControl('', [Validators.required]);
  private urlFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(
      /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()[\]{};:'".,<>?«»“”‘’]))/i
    ),
  ]);
  matcher = new MyErrorStateMatcher();

  constructor(public questionService: QuestionsService) {
    effect(() => {
      const ct = this.controlType();

      // Clear controls that come and go for a type.
      this.questionForm.removeControl('url');
      this.questionForm.removeControl('img');
      this.questionForm.removeControl('placeholder');

      // Add controls for this particular type.
      switch (ct) {
        case 'url':
          this.questionForm.addControl('url', this.urlFormControl);
          break;

        case 'img':
          this.questionForm.addControl('img', this.imgFormControl);
          break;

        case 'textbox':
          this.questionForm.addControl(
            'placeholder',
            this.placeholderFormControl
          );
          break;

        case 'checkbox':
          break;
      }
    });

    effect(() => {
      const q = this.question();
      if (q) {
        this.textFormControl.setValue(q.text);
        this.urlFormControl.setValue(q.url || ' ');
        this.controlType.set(q.type || '');
        this.placeholderFormControl.setValue(q.type || '');
        this.attachmentRequired = q.attachmentRequired || false;
      }
    });

    this.questionForm = new FormGroup({
      text: this.textFormControl,
    });
  }

  setControlType(value: QuestionType) {
    this.controlType.set(value);
  }

  save() {
    if (this.questionForm.invalid) {
      return;
    }
    const u = this.question();

    const result = <Question>{
      ...u,
      text: this.textFormControl.getRawValue() || '',
      url: this.urlFormControl.getRawValue() || undefined,
      img: this.imgFormControl.getRawValue() || undefined,
      placeholder: this.placeholderFormControl.getRawValue() || undefined,
      attachmentRequired: this.attachmentRequired,
      type: this.controlType(),
    };

    this.questionService.updateQuestion(result);
  }
}
