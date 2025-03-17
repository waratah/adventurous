import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  Firestore,
  FirestoreDataConverter,
  collection,
  collectionData,
  doc,
  getDoc,
  setDoc,
} from '@angular/fire/firestore';
import { Observable, ReplaySubject, map } from 'rxjs';
import { User } from '../definitions';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private myId = '174424';

  // temporary to negate check
  public get userId(): string {
    return this.myId;
  }

  public set userId(id: string) {
    this.myId = id;
    this.loadUser(this.myId);
  }

  private userCollection: CollectionReference<User, DocumentData>;

  allUsers$: Observable<User[]>;

  private currentUser = new ReplaySubject<User | undefined>(1);
  currentUser$ = this.currentUser.asObservable();

  constructor(private store: Firestore) {
    this.userCollection = collection(this.store, 'users').withConverter(
      this.createUserConverter
    );

    this.allUsers$ = collectionData(this.userCollection).pipe(
      map((list) => list.sort((a, b) => a.name.localeCompare(b.name)))
    );

    this.loadUser(this.myId);
  }

  private createUserConverter: FirestoreDataConverter<User> = {
    toFirestore(modelObject) {
      const objToUpload = { ...modelObject } as DocumentData; // DocumentData is mutable
      delete objToUpload['scoutNumber']; // make sure to remove ID so it's not uploaded to the document
      Object.keys(objToUpload).forEach((key) => {
        if (!objToUpload[key]) {
          delete objToUpload[key];
        }
      });
      return objToUpload;
    },
    fromFirestore(snapshot, options) {
      const data = snapshot.data(options); // "as Omit<Instance<typeof CompanyModel>, "id">" could be added here
      // spread data first, so an incorrectly stored id gets overridden
      return <User>{
        ...data,
        scoutNumber: snapshot.id,
      };
    },
  };

  private loadUser(id: string) {
    if(id) {
    getDoc(doc(this.userCollection, id)).then((d) => {
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
  } else {
    this.currentUser.next(undefined);
  }
  }

  public saveUser(user: User) {
    if (user.scoutNumber) {
      const docRef = doc(this.store, 'users', user.scoutNumber);
      setDoc(docRef, user).catch((x) => console.error(x));
      return true;
    } else {
      console.error('Scout Number was not defined in create user, aborting');
      return false;
    }
  }
}
