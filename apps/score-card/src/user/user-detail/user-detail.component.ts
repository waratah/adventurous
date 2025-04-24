import { Component, effect, model, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { User } from '../../definitions';
import { UsersService } from '../../service';
import { MyErrorStateMatcher } from '../../utils';

@Component({
  selector: 'app-user-detail',
  imports: [MatButton, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, ReactiveFormsModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css',
})
export class UserDetailComponent {
  readonly states: string[];
  user = model<User>();
  saved = signal(false);
  error = signal(false);

  userForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    state: new FormControl('NSW', [Validators.required]),
    group: new FormControl('', [Validators.required]),
    section: new FormControl('', [Validators.required]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(
        /^(?:\+?(61))? ?(?:\((?=.*\)))?(0?[2-57-8])\)? ?(\d\d(?:[- ](?=\d{3})|(?!\d\d[- ]?\d[- ]))\d\d[- ]?\d[- ]?\d{3})$/
      ),
    ]),
    member: new FormControl('', [Validators.required, Validators.pattern(/[1-9]+/)]),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  matcher = new MyErrorStateMatcher();

  constructor(public userService: UsersService, private router: Router) {
    this.userForm.controls.state.setValue('NSW');
    this.states = this.userService.states;

    effect(() => {
      const u = this.user();
      if (u) {
        this.userForm.controls.email.setValue(u.email);
        this.userForm.controls.group.setValue(u.group);
        this.userForm.controls.name.setValue(u.name);
        this.userForm.controls.state.setValue(u.state);
        this.userForm.controls.member.setValue(u.scoutNumber);
        this.userForm.controls.section.setValue(u.section);
        this.userForm.controls.phone.setValue(u.phone);
      }
    });
  }

  public async saveUser() {
    this.error.set(false);
    this.saved.set(false);

    if (this.userForm.invalid) {
      this.error.set(true);
      return;
    }
    const u = this.user();

    if (u) {
      const result = {
        ...u,
        email: this.userForm.controls.email.getRawValue() || '',
        group: this.userForm.controls.group.getRawValue() || '',
        name: this.userForm.controls.name.getRawValue() || '',
        state: this.userForm.controls.state.getRawValue() || '',
        scoutNumber: this.userForm.controls.member.getRawValue() || '',
        section: this.userForm.controls.section.getRawValue() || '',
        phone: this.userForm.controls.phone.getRawValue() || '',
      };

      if (await this.userService.saveUser(result)) {
        this.saved.set(true);
      } else {
        this.error.set(true);
      }
    }
  }

  public cancel() {
    this.router.navigate(['/']);
  }
}
