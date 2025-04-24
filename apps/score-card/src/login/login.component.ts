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
import { UsersService } from '../service';
import { User } from '../definitions';

@Component({
  selector: 'app-login',
  imports: [
    MatToolbarModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
  ],
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

  constructor(private authService: AuthService, private userService: UsersService, private router: Router) {
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
    const email = this.useridFormControl.value || '';
    const password = this.passwordFormControl.value || '';
    if (this.useridFormControl.valid) {
      return this.actualLogin(email, password);
    }
  }

  private actualLogin(email: string, password: string) {
    return this.authService.login(email, password).then(async data => {
      const scoutNumber = await this.userService.getScoutNumber(data.user.uid);
      if (scoutNumber) {
        this.userService.userId = scoutNumber;
        this.router.navigateByUrl('/groups');
        return;
      }

      console.error('This should never happen, user should be set up once and for all')

      const user: User = {
        email,
        group: '',
        name: '',
        phone: '',
        scoutNumber: '',
        section: '',
        state: 'NSW',
        uid: data.user.uid,
        verifyGroups: [],
      };
      this.userService.primeUser(user);
      this.router.navigateByUrl('/user');
    });
  }

  async guestLogin() {
    this.actualLogin('guest@nsw.scouts.com.au', 'fake_password');
  }
}
