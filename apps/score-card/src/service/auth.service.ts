import { Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { Auth, browserSessionPersistence, signInWithEmailAndPassword, signOut, user, User } from '@angular/fire/auth';
import { createUserWithEmailAndPassword, ParsedToken, setPersistence, UserCredential } from 'firebase/auth';
import { Observable } from 'rxjs';
import { AuthClaims } from '../definitions';

interface ExtendedParsedToken extends ParsedToken {
  scoutNumber?: string;
  isAdmin?: boolean;
  isVerify?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(private firebaseAuth: Auth) {
    this.setSessionStoragePersistence();
    this.user$ = user(this.firebaseAuth);
  }

  public async displayClaims() {
    this.firebaseAuth.currentUser
      ?.getIdTokenResult()
      .then(idTokenResult => {
        // Access user's custom claims
        const claims: ExtendedParsedToken = idTokenResult.claims;
        // Update the UI based on the claims
        console.log(claims);
      })
      .catch(error => {
        // Handle error
        console.error(error);
      });
  }

  public async authClaims(): Promise<AuthClaims> {
    if (this.firebaseAuth.currentUser) {
      const token = await this.firebaseAuth.currentUser.getIdTokenResult();

      // Access user's custom claims
      const claims: ExtendedParsedToken = token.claims;
      // Update the UI based on the claims
      const claim: AuthClaims = {
        isAdmin: claims.isAdmin ?? false,
        isVerify: claims.isVerify ?? false,
        scoutNumber: claims.scoutNumber ?? '',
      };
      return claim;
    } else {
      const claim: AuthClaims = {
        isAdmin: false,
        isVerify: false,
        scoutNumber: '',
      };
      return claim;
    }
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

  error(e: FirebaseError) {
    const code = e.code.split('/')[0];
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Email is already in use.';

      default:
        return e.message;
    }
  }
}
