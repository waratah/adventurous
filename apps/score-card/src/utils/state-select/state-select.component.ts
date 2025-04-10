import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-state-select',
  imports: [MatFormField, MatSelectModule, ReactiveFormsModule],
  templateUrl: './state-select.component.html',
  styleUrl: './state-select.component.css',
})
export class StateSelectComponent {
  formControl = input.required<FormControl>();

  states = ['NSW', 'Queensland', 'Victoria', 'ACT', 'South Australia', 'Western Australia', 'Tasmania', 'Northern Territory', 'National'];
}
