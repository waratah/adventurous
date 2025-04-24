import { NgClass } from '@angular/common';
import { Component, effect, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { User } from '../../definitions';
import { UsersService } from '../../service';

@Component({
  selector: 'app-user-list',
  imports: [MatCardModule, MatToolbarModule, RouterLink, NgClass, MatCheckbox, MatButton],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent {
  selected:  { [key: string]: boolean } = {};

  users: Signal<User[] | undefined>;
  currentUserId: Signal<string | undefined>;
  constructor(userService: UsersService) {
    this.users = toSignal(userService.allUsers$);
    this.currentUserId = toSignal(userService.currentUser$.pipe(map(u => u?.scoutNumber)));

    effect(() => {
      this.users()?.forEach( u => {
        if( this.selected[u.scoutNumber] === undefined) {
          this.selected[u.scoutNumber] = false;
        }
      })
    })
  }

  change( scoutNumber: string,  checked: boolean) {
    if( checked ) {
      this.selected[scoutNumber] = true;
    } else {
      delete this.selected[scoutNumber];
    }
  }
}
