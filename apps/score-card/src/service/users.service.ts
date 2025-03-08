import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
} from '@angular/fire/firestore';
import { ReplaySubject, take } from 'rxjs';
import { User, UserId } from '../definitions';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private myId = '174424';

  // temporary to negate check
  public get userId(): UserId {
    return Number(this.myId);
  }

  public set userId(id: UserId) {
    this.myId = `${id}`;
    this.loadUser(this.myId);
  }

  private baseline: User[] = [
    {
      email: 'ken.foskey@nsw.scouts.com.au',
      group: 'South Met Adventurous',
      id: 1,
      name: 'Ken Foskey',
      scoutNumber: '174424',
      section: 'Region',
      state: 'NSW',
      verifyGroups: [],
    },
    {
      email: 'mike.random@nsw.scouts.com.au',
      group: 'Random group',
      id: 2,
      name: 'Mike Random',
      scoutNumber: '1234',
      section: 'Venturer',
      state: 'NSW',
      verifyGroups: [],
    },
  ];

  private allUsers = new ReplaySubject<User[]>(1);
  allUsers$ = this.allUsers.asObservable();

  private currentUser = new ReplaySubject<User | undefined>(1);
  currentUser$ = this.currentUser.asObservable();

  constructor(private store: Firestore) {
    this.currentUser.next(this.baseline[0]);
    this.allUsers.next(this.baseline);

    this.loadUser(this.myId);
  }

  private loadUser(id: string) {
    getDoc(doc(this.store, 'users', id)).then((d) => {
      const result = d.data() as User | undefined;
      if (result) {
        if (!result.state) {
          result.state = 'NSW';
        }
        this.currentUser.next(result);
      } else {
        this.currentUser.next(undefined);
      }
    });
  }

  public loadAllUsers() {
    getDocs(collection(this.store, 'users'))
      .then((d) => {
        const list: User[] = [];
        d.forEach((q) => {
          const user = q.data() as User | undefined;
          if (user) {
            user.id = Number(q.id);
            list.push(user as User);
          }
        });
        this.allUsers.next(list.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch((x) => console.error(x));
  }

  public createUser(user: User) {
    this.loadAllUsers();
    this.allUsers.pipe(take(1)).subscribe((users) => {
      const userId = Math.max(...users.map((x) => x.id)) + 1;
      const docRef = doc(this.store, 'user', `${userId}`);
      setDoc(docRef, user).catch((x) => console.error(x));
    });
  }

  public saveUser(user: User) {
    const docRef = doc(this.store, 'users', `${user.id}`);
    setDoc(docRef, user).catch((x) => console.error(x));
  }
}
