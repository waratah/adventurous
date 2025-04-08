import { Injectable } from '@angular/core';
import { Auth, browserSessionPersistence, signInWithEmailAndPassword, signOut, user, User } from '@angular/fire/auth';
import { createUserWithEmailAndPassword, setPersistence, UserCredential } from 'firebase/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(private firebaseAuth: Auth) {
    this.setSessionStoragePersistence();
    this.user$ = user(this.firebaseAuth);
  }

  private setSessionStoragePersistence(): void {
    setPersistence(this.firebaseAuth, browserSessionPersistence);
  }

  async login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.firebaseAuth, email, password);
  }

  async logout(): Promise<void> {
    return signOut(this.firebaseAuth).then(() => {
      sessionStorage.clear();
    });
  }

  async createUser(email: string, password: string) {
    return createUserWithEmailAndPassword(this.firebaseAuth, email, password);
  }
}
