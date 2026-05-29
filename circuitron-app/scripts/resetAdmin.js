const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function resetAdmin() {
  try {
    const email = 'admin@circuitron.com';
    const password = 'circuitronAdmin!';
    
    let user;
    try {
      user = await admin.auth().getUserByEmail(email);
      await admin.auth().updateUser(user.uid, { password });
      console.log('Admin password updated successfully.');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        user = await admin.auth().createUser({
          email,
          password,
          displayName: 'Administrator',
        });
        console.log('Admin user created successfully.');
      } else {
        throw err;
      }
    }
    
    // Ensure Firestore user document exists and is set to admin
    const db = admin.firestore();
    await db.collection('users').doc(user.uid).set({
      email,
      name: 'Administrator',
      role: 'admin',
      participantId: 'ADMIN'
    }, { merge: true });
    
    console.log('Firestore admin document verified.');
  } catch (error) {
    console.error('Error:', error);
  }
}

resetAdmin();
