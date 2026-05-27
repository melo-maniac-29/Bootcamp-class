import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { uid, newPassword } = await req.json();

    if (!uid || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Update password using Firebase Admin SDK
    await authAdmin.updateUser(uid, { password: newPassword });

    // Mark password as created in Firestore
    await dbAdmin.collection('users').doc(uid).update({
      passwordCreated: true,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}