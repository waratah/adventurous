import { Component, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';


@Component({
  selector: 'app-login',
  imports: [MatToolbarModule, ReactiveFormsModule,MatButtonModule, MatFormFieldModule , MatInputModule, MatCardModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  hide = signal(true);

  loginForm: FormGroup;
  private useridFormControl = new FormControl('', [Validators.required]);
  private passwordFormControl = new FormControl('', [Validators.required]);


  /**
   *
   */
  constructor() {
    this.loginForm = new FormGroup({
      name: this.useridFormControl,
      password: this.passwordFormControl,
    });
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  save() {

  }


}
