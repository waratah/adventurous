import  { onDocumentCreatedWithAuthContext } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { Auth } from '@angular/fire/auth';

initializeApp();

exports.onDocumentCreatedWithAuthContext = onDocumentCreatedWithAuthContext(
  "your_collection/{documentId}",
  async (event) => {
    const firestore = getFirestore();
    const document = event.data?.data();
    const authContext = event.Auth;

    if (!authContext) {
      console.log("No authentication context found for this operation.");
      return;
    }

    const userId = authContext.uid;
    const userEmail = authContext.token.email;

    console.log(`Document created by user: ${userId} (${userEmail})`);
    console.log("Document data:", document);

    try {
      await firestore.collection("logs").add({
        userId: userId,
        email: userEmail,
        timestamp: new Date(),
        message: `Document created with ID: ${event.params.documentId}`,
        documentData: document,
      });
    } catch (error) {
      console.error("Error writing to logs:", error);
    }
  }
);
