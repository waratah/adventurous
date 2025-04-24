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
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable, ReplaySubject, map } from 'rxjs';
import { Security, User } from '../definitions';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private myId = '';

  public readonly states = [
    'NSW',
    'Queensland',
    'Victoria',
    'ACT',
    'South Australia',
    'Western Australia',
    'Tasmania',
    'Northern Territory',
    'National',
  ];

  // temporary to negate check
  public get userId(): string {
    return this.myId;
  }

  public set userId(id: string) {
    this.myId = id;
    this.loadUser(this.myId);
  }

  private userCollection: CollectionReference<User, DocumentData>;
  private securityCollection: CollectionReference<Security, DocumentData>;

  allUsers$: Observable<User[]>;

  private currentUser = new ReplaySubject<User | undefined>(1);
  currentUser$ = this.currentUser.asObservable();

  constructor(private store: Firestore) {
    this.userCollection = collection(this.store, 'users').withConverter(this.createUserConverter);
    this.securityCollection = collection(this.store, 'security') as CollectionReference<Security, DocumentData>;

    this.allUsers$ = collectionData(this.userCollection).pipe(map(list => list.sort((a, b) => a.name.localeCompare(b.name))));

    this.loadUser(this.myId);
  }

  private createUserConverter: FirestoreDataConverter<User> = {
    toFirestore(modelObject) {
      const objToUpload = { ...modelObject } as DocumentData; // DocumentData is mutable
      delete objToUpload['scoutNumber']; // make sure to remove ID so it's not uploaded to the document
      Object.keys(objToUpload).forEach(key => {
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

  private loadUser(scoutNumber: string) {
    if (scoutNumber) {
      getDoc(doc(this.userCollection, scoutNumber))
        .then(d => {
          const result = d.data();
          if (result) {
            this.currentUser.next(result);
          } else {
            this.currentUser.next(undefined);
          }
        })
        .catch(error => {
          console.error({ error, scoutNumber });
        });
    } else {
      this.currentUser.next(undefined);
    }
  }

  async loadUID(uid: string | undefined) {
    if (uid) {
      const security = doc(this.securityCollection, uid);
      getDoc(security).then(async d => {
        const result = d.data() as Security | undefined;
        if (result) {
          if (result.scoutNumber) {
            this.userId = result.scoutNumber;
          }
        }
      });
    }
  }

  async loadEmail(email: string, uid: string) {
    const q = query(this.userCollection, where('email', '==', email));

    const querySnapshot = await getDocs(q);
    let result = false;
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      result = true;
      const user = doc.data();
      if (!user.uid && uid) {
        user.uid = uid;
        updateDoc(doc.ref, { uid });
      }
      this.currentUser.next(user);
      this.myId = user.scoutNumber;
      this.security(uid, user);
    });
    if (!result) {
      const user: User = {
        email,
        group: '',
        name: '',
        phone: '',
        scoutNumber: '',
        section: '',
        state: 'NSW',
        uid,
        verifyGroups: [],
      };
      this.currentUser.next(user);
      console.error(`Unable to locate: ${email}`);
    }
    return result;
  }

  public primeUser(user: User) {
    this.currentUser.next(user);
  }

  async security(uid: string, user: User) {
    const security = doc(this.securityCollection, uid);
    getDoc(security).then(async d => {
      const result = d.data() as Security | undefined;
      if (result) {
        if (!result.scoutNumber) {
          result.scoutNumber = user.scoutNumber;
          updateDoc(security, { scoutNumber: user.scoutNumber });
        }
      } else {
        const sec: Security = { uid, scoutNumber: user.scoutNumber };
        await setDoc(security, sec);
      }
    });
  }

  async getScoutNumber(uid: string) {
    const security = doc(this.securityCollection, uid);
    const record = await getDoc(security);
    const result = record.data() as Security | undefined;
    if (result) {
      return result.scoutNumber;
    }
    return undefined;
  }

  public async saveUser(user: User) {
    if (user.scoutNumber) {
      if (user.uid) {
        const secRef = doc(this.securityCollection, user.uid);
        const result = await getDoc(secRef);
        const sec = result.data();
        if (!sec) {
          await setDoc(secRef, { scoutNumber: user.scoutNumber, uid: user.uid });
        }
      }
      const docRef = doc(this.userCollection, user.scoutNumber);
      await setDoc(docRef, user);
      return true;
    } else {
      console.error('Scout Number was not defined in create user, aborting');
      return false;
    }
  }
}
