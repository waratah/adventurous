import * as admin from 'firebase-admin';

import { User } from '../score-card/src/definitions/User';

const environment = require('/Users/ken/source/firebase/adventurousscorecard.json');

function updateUsers() {
  admin.initializeApp({
    credential: admin.credential.cert(environment),
  });

  const store = admin.firestore();

  const userCollection = store.collection('users');
  const securityCollection = store.collection('security');

  userCollection.get().then(result => {
    result.docs.forEach(userData => {
      const user = userData.data() as User;

      user.scoutNumber = userData.id;

      admin
        .auth()
        .getUserByEmail(user.email)
        .then(userRecord => {
          const uid = userRecord.uid;

          securityCollection
            .doc(uid)
            .get()
            .then(response => {
              if (response?.data()) {
                const security = response.data();
                // clear claims to start with
                const claims: Record<string, string | boolean> = {
                  scoutNumber: user.scoutNumber,
                };
                if (security?.isAdmin) {
                  claims.isAdmin = true;
                }
                if (security?.isVerify) {
                  claims.isVerify = true;
                }

                console.log(`${user.scoutNumber}: ${uid} has claims`, claims);
                admin.auth().setCustomUserClaims(uid, claims);
              }
            });
        })
        .catch(error => {
          console.error('Error setting altId:', error);
        });
    });
  });
}

updateUsers();
