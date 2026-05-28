import { NextResponse } from 'next/server';
import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const { participantId, password } = await request.json();

    if (!participantId || !password) {
      return NextResponse.json({ error: 'Participant ID and password are required' }, { status: 400 });
    }

    const q = dbAdmin.collection('users').where('participantId', '==', participantId).limit(1);
    const snap = await q.get();

    if (snap.empty) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    const userDoc = snap.docs[0];
    const userData = userDoc.data();
    
    if (userData.firstLogin !== true) {
      return NextResponse.json({ error: 'Account already set up. Please log in normally.' }, { status: 400 });
    }

    // Update Firebase Auth password
    await authAdmin.updateUser(userDoc.id, {
      password: password
    });

    // Mark firstLogin as false
    await dbAdmin.collection('users').doc(userDoc.id).update({
      firstLogin: false,
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      success: true,
      email: userData.email
    });
  } catch (error) {
    console.error('Error setting up password:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
