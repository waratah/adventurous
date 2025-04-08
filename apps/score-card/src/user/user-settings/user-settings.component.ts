import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { UserDetailComponent } from '../user-detail/user-detail.component';
import { UsersService } from '../../service/users.service';

@Component({
  selector: 'app-user-settings',
  imports: [UserDetailComponent, AsyncPipe],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.css',
})
export class UserSettingsComponent {
  constructor(public userService: UsersService) {}
}
