import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../service/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [MatToolbarModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatCardModule, MatIconModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  hide = signal(true);
  error = signal(false);

  loginForm: FormGroup;
  private useridFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
  ]);
  private passwordFormControl = new FormControl('', [Validators.required]);

  constructor(private authService: AuthService, private router: Router) {
    this.loginForm = new FormGroup({
      name: this.useridFormControl,
      password: this.passwordFormControl,
    });
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  async login() {
    this.error.set(false);
    if (this.useridFormControl.valid) {
      return this.authService
        .login(this.useridFormControl.value || '', this.passwordFormControl.value || '')
        .then(() => {
          this.router.navigateByUrl('/groups');
        })
        .catch(error => {
          this.error.set(true);
          console.error('Email/Password Sign-In error:', error);
        });
    }
  }

  async guestLogin() {
    return this.authService
      .login('guest@nsw.scouts.com.au', 'fake_password')
      .then(() => {
        this.router.navigateByUrl('/groups');
      })
      .catch(error => {
        this.error.set(true);
        console.error('Email/Password Sign-In error:', error);
      });
  }
}
