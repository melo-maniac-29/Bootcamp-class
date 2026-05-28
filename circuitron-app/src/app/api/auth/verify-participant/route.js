import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const { participantId } = await request.json();

    if (!participantId) {
      return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 });
    }

    const q = dbAdmin.collection('users').where('participantId', '==', participantId).limit(1);
    const snap = await q.get();

    if (snap.empty) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    const userData = snap.docs[0].data();

    return NextResponse.json({ 
      success: true, 
      firstLogin: userData.firstLogin === true,
      email: userData.email,
      role: userData.role
    });
  } catch (error) {
    console.error('Error verifying participant:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
