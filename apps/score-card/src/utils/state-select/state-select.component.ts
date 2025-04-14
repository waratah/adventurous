import { Component, input, signal, OnInit, forwardRef } from '@angular/core';
import { ControlContainer, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-state-select',
  imports: [MatFormField, MatSelectModule, ReactiveFormsModule],
  templateUrl: './state-select.component.html',
  styleUrl: './state-select.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StateSelectComponent),
      multi: true,
    },
  ],
})
export class StateSelectComponent implements OnInit {
  formControlName = input.required<string>();
  label = input<string>('State');

  stateCode = signal('NSW');

  invalid = signal(false);
  formControl = signal<FormControl>(new FormControl());

  states = ['NSW', 'Queensland', 'Victoria', 'ACT', 'South Australia', 'Western Australia', 'Tasmania', 'Northern Territory', 'National'];

  constructor(private controlContainer: ControlContainer) {
  }

  ngOnInit(): void {
    this.formControl.set(this.controlContainer.control?.get(this.formControlName()) as FormControl);

    this.stateCode.set(this.formControl().value);
  }

  isInvalid() {
    return this.formControl().invalid;
  }

  // Method to check if the control has been touched
  isTouched() {
    return this.formControl().touched;
  }
}
