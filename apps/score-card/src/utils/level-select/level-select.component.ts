import { Component, input, model, OnInit, signal } from '@angular/core';
import { ControlContainer, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatSelectModule } from '@angular/material/select';
import { LevelCode } from '../../definitions';

@Component({
  selector: 'app-level-select',
  imports: [MatFormField, MatSelectModule, ReactiveFormsModule],
  templateUrl: './level-select.component.html',
  styleUrl: './level-select.component.css',
})
export class LevelSelectComponent implements OnInit {
  formControlName = input.required<string>();
  label = input<string>('Level of Achievement');

  level = model('safe');

  invalid = signal(false);
  formControl = signal<FormControl>(new FormControl());

  levels = [
    { description: 'Safe Participant', level: 'safe' },
    { description: 'Trained Participant', level: 'trained' },
    { description: 'Assistant Guide', level: 'assist' },
    { description: 'Guide', level: 'guide' },
  ];

  constructor(private controlContainer: ControlContainer) {}

  ngOnInit(): void {
    this.formControl.set(this.controlContainer.control?.get(this.formControlName()) as FormControl);

    this.level.set(this.formControl().value);
  }

  isInvalid() {
    return this.formControl().invalid;
  }

  // Method to check if the control has been touched
  isTouched() {
    return this.formControl().touched;
  }

  changed(event: LevelCode) {
    this.level.set(event);
  }
}
