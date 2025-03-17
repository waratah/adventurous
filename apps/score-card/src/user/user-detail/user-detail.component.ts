import { Component, model, effect } from '@angular/core';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UsersService } from '../../service/users.service';
import { Router } from '@angular/router';
import { User } from '../../definitions';
@Component({
  selector: 'app-user-detail',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css',
})
export class UserDetailComponent {
  user = model<User>();

  nameFormControl = new FormControl('', [Validators.required]);
  stateFormControl = new FormControl('', [Validators.required]);
  groupFormControl = new FormControl('', [Validators.required]);
  sectionFormControl = new FormControl('', [Validators.required]);
  phoneFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(
      /^(?:\+?(61))? ?(?:\((?=.*\)))?(0?[2-57-8])\)? ?(\d\d(?:[- ](?=\d{3})|(?!\d\d[- ]?\d[- ]))\d\d[- ]?\d[- ]?\d{3})$/
    ),
  ]);
  memberFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/[1-9]+/),
  ]);
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  matcher = new MyErrorStateMatcher();

  constructor(public userService: UsersService, private router: Router) {
    this.stateFormControl.setValue('NSW');

    effect(() => {
      const u = this.user();
      if (u) {
        this.emailFormControl.setValue(u.email);
        this.groupFormControl.setValue(u.group);
        this.nameFormControl.setValue(u.name);
        this.stateFormControl.setValue(u.state);
        this.memberFormControl.setValue(u.scoutNumber);
        this.sectionFormControl.setValue(u.section);
        this.phoneFormControl.setValue(u.phone);
      }
    });
  }

  saveUser() {
    const u = this.user();

    if (u) {
      const result = {
        ...u,
        email: this.emailFormControl.getRawValue() || '',
        group: this.groupFormControl.getRawValue() || '',
        name: this.nameFormControl.getRawValue() || '',
        state: this.stateFormControl.getRawValue() || '',
        scoutNumber: this.memberFormControl.getRawValue() || '',
        section: this.sectionFormControl.getRawValue() || '',
        phone: this.phoneFormControl.getRawValue() || '',
      };

      this.userService.saveUser(result);
    }
  }
}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}
