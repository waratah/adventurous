import { AsyncPipe } from '@angular/common';
import { Component, output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { map, Observable, startWith, combineLatest } from 'rxjs';
import { Question } from '../../definitions';
import { QuestionsService } from '../../service/questions.service';

@Component({
  selector: 'app-question-select',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    AsyncPipe,
  ],
  templateUrl: './question-select.component.html',
  styleUrl: './question-select.component.css',
})
export class QuestionSelectComponent {
  public optionChange = output<Question>();

  myControl = new FormControl<string | Question>('');
  filteredOptions: Observable<Question[]>;

  constructor(questionService: QuestionsService) {
    const filterValue = this.myControl.valueChanges.pipe(startWith(''));
    this.filteredOptions = combineLatest([
      filterValue,
      questionService.allQuestions$,
    ]).pipe(
      map(([value, questions]) => {
        const name = typeof value === 'string' ? value : value?.text;
        return (name ? this.matchText(name, questions) : questions).slice(
          0,
          10
        );
      })
    );
  }

  change(event: MatAutocompleteSelectedEvent) {
    const result = this.myControl.value;
    if (result && typeof result !== 'string') {
      this.optionChange.emit(result);
    }
  }

  displayFn(question: Question): string {
    return question?.text || '';
  }

  private matchText(name: string, questions: Question[]): Question[] {
    const filterValue = name.toLowerCase();

    return questions.filter((option) =>
      option.text.toLowerCase().includes(filterValue)
    );
  }
}
