const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const authAdmin = admin.auth();
const dbAdmin = admin.firestore();

async function createTestUser() {
  const email = 'testuser@example.com';
  const password = 'password123';
  const participantId = 'TEST-001';

  try {
    // 1. Create Firebase Auth User
    const userRecord = await authAdmin.createUser({
      email: email,
      password: password,
      displayName: 'Test Student',
    });

    console.log('Successfully created new user in Auth:', userRecord.uid);

    // 2. Create Firestore Document
    await dbAdmin.collection('users').doc(userRecord.uid).set({
      participantId: participantId,
      email: email,
      name: 'Test Student',
      role: 'student',
      firstLogin: false,
      createdAt: new Date()
    });

    console.log('Successfully created user document in Firestore.');
    console.log('--------------------------------------------------');
    console.log(`LOGIN DETAILS:`);
    console.log(`Participant ID: ${participantId}`);
    console.log(`Password: ${password}`);
    console.log('--------------------------------------------------');

  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('Test user already exists! Getting their record...');
      const userRecord = await authAdmin.getUserByEmail(email);
      console.log(`User UID: ${userRecord.uid}`);
      
      // Update the password to ensure it's correct
      await authAdmin.updateUser(userRecord.uid, { password: password });
      
      // Ensure the firestore document is correct
      await dbAdmin.collection('users').doc(userRecord.uid).set({
        participantId: participantId,
        email: email,
        name: 'Test Student',
        role: 'student',
        firstLogin: false,
        updatedAt: new Date()
      }, { merge: true });
      
      console.log('Updated existing test user details.');
      console.log('--------------------------------------------------');
      console.log(`LOGIN DETAILS:`);
      console.log(`Participant ID: ${participantId}`);
      console.log(`Password: ${password}`);
      console.log('--------------------------------------------------');
    } else {
      console.error('Error creating new user:', error);
    }
  }
}

createTestUser();
