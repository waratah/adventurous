import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../definitions';
import { AuthService, UsersService } from '../../service';
import { MyErrorStateMatcher } from '../../utils';

interface UserPlus extends User {
  password?: string | null;
}

@Component({
  selector: 'app-user-new',
  imports: [
    FormsModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user-new.component.html',
  styleUrl: './user-new.component.css',
})
export class UserNewComponent {
  hidePassword = signal(true);
  error = signal(false);

  readonly states: string[];

  userForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    state: new FormControl('NSW', [Validators.required]),
    password: new FormControl('', [Validators.required]),
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

  constructor(public userService: UsersService, private authService: AuthService, private router: Router) {
    this.userForm.controls['state'].setValue('NSW');
    this.states = this.userService.states;
  }

  instantUser() {
    this.error.set(false);

    this.authService
      // .createUser('ken.foskey@nsw.scouts.com.au', 'test')
      .createUser('guest@nsw.scouts.com.au', 'fake_password')
      .then(user => {
        console.log(user);
      })
      .catch(error => {
        console.error({ error });
        this.error.set(true);
      });
  }

  createUser() {
    this.error.set(false);

    if (this.userForm.invalid) {
      return;
    }

    const user: UserPlus = {
      email: this.userForm.controls.email.getRawValue() || '',
      password: this.userForm.controls.password.getRawValue(),
      group: this.userForm.controls.group.getRawValue() || '',
      name: this.userForm.controls.name.getRawValue() || '',
      state: this.userForm.controls.state.getRawValue() || '',
      scoutNumber: this.userForm.controls.member.getRawValue() || '',
      section: this.userForm.controls.section.getRawValue() || '',
      phone: this.userForm.controls.phone.getRawValue() || '',
      verifyGroups: [],
    };

    this.authService
      .createUser(user.email, user.password || '')
      .then(() => {
        delete user.password;

        this.userService.saveUser(user);
      })
      .catch(error => {
        console.error(error);
        this.error.set(true);
      });
  }

  passwordClick(event: Event) {
    this.hidePassword.set(!this.hidePassword());
    event.stopPropagation();
  }
}
