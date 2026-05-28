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

async function resetAdminPassword() {
  const email = 'admin@circuitron.com';
  const newPassword = 'circuitronAdmin!';

  try {
    const userRecord = await authAdmin.getUserByEmail(email);
    
    // Update the password
    await authAdmin.updateUser(userRecord.uid, { password: newPassword });
    
    console.log('Successfully updated the admin password.');
    console.log('--------------------------------------------------');
    console.log(`NEW ADMIN LOGIN DETAILS:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}`);
    console.log('--------------------------------------------------');

  } catch (error) {
    console.error('Error updating admin password:', error);
  }
}

resetAdminPassword();
