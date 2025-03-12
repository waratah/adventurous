import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../definitions';
import { UsersService } from '../service/users.service';

@Component({
  selector: 'app-pdf-user',
  imports: [AsyncPipe],
  templateUrl: './pdf-user.component.html',
  styleUrl: './pdf-user.component.css',
})
export class PdfUserComponent {
  user$: Observable<User | undefined>;

  constructor(private userService: UsersService) {
    this.user$ = this.userService.currentUser$;
  }
}
