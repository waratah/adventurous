import { Component } from '@angular/core';
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

@Component({
  selector: 'app-user-new',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user-new.component.html',
  styleUrl: './user-new.component.css',
})
export class UserNewComponent {
  nameFormControl = new FormControl('', [Validators.required]);
  stateFormControl = new FormControl('', [Validators.required]);
  groupFormControl = new FormControl('', [Validators.required]);
  sectionFormControl = new FormControl('', [Validators.required]);
  phoneFormControl = new FormControl('', [Validators.required, Validators.pattern(/^(?:\+?(61))? ?(?:\((?=.*\)))?(0?[2-57-8])\)? ?(\d\d(?:[- ](?=\d{3})|(?!\d\d[- ]?\d[- ]))\d\d[- ]?\d[- ]?\d{3})$/)]);
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
    userService.loadAllUsers();
    this.stateFormControl.setValue('NSW');
  }

  createUser() {
    const user: User = {
      email: this.emailFormControl.getRawValue() || '',
      group: this.groupFormControl.getRawValue() || '',
      name: this.nameFormControl.getRawValue() || '',
      state: this.stateFormControl.getRawValue() || '',
      id: 0,
      scoutNumber: this.memberFormControl.getRawValue() || '',
      section: this.sectionFormControl.getRawValue() || '',
      phone: this.phoneFormControl.getRawValue() || '',
      verifyGroups: [],
    };

    console.log(user);

    this.userService.createUser(user);
  }
}
