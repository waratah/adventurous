import { onDocumentCreatedWithAuthContext } from 'firebase-functions/v2/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Security } from '../score-card/src/definitions/Security';

const app = initializeApp();

exports.onDocumentCreatedWithAuthContext = onDocumentCreatedWithAuthContext('security/{documentId}', async event => {
  const firestore = getFirestore();
  if (event.data) {
    const document = event.data.data() as Security;

    const uid = event.data.id;

    const auth = getAuth(app);

    const userRecord = await auth.getUser(uid);

    const authContext = event;

    if (!authContext) {
      console.log('No authentication context found for this operation.');
      return;
    }

    const userId = authContext.uid;
    const userEmail = authContext.token.email;

    console.log(`Document created by user: ${userId} (${userEmail})`);
    console.log('Document data:', document);

    try {
      await firestore.collection('logs').add({
        userId: userId,
        email: userEmail,
        timestamp: new Date(),
        message: `Document created with ID: ${event.params.documentId}`,
        documentData: document,
      });
    } catch (error) {
      console.error('Error writing to logs:', error);
    }
  }
});
