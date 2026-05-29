import { NextResponse } from 'next/server';
import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/authMiddleware';

export async function POST(request) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const data = await request.json();
    const { participantId, email: reqEmail, password: reqPassword, displayName, role, bootcampId, firstLogin, level, volunteerId, teamId } = data;

    if (!displayName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const email = reqEmail || `${participantId?.toLowerCase()}@circuitron.local`;
    const password = reqPassword || 'TempPassword123!';

    let userRecord;
    try {
      // Create user in Firebase Auth with temp password
      userRecord = await authAdmin.createUser({
        email,
        password,
        displayName,
      });
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        userRecord = await authAdmin.getUserByEmail(email);
      } else {
        throw err;
      }
    }

    const uid = userRecord.uid;

    const userData = {
      uid,
      participantId: participantId || displayName,
      email,
      displayName,
      role,
      bootcampId: bootcampId || null,
      firstLogin: firstLogin !== undefined ? firstLogin : true,
      level: level || 'beginner',
      volunteerId: volunteerId || '',
      teamId: teamId || '',
      streakCount: 0,
      lastActiveDate: '',
      createdAt: new Date(),
      deleted: false,
    };

    // Save to root users collection
    await dbAdmin.collection('users').doc(uid).set(userData, { merge: true });
    
    // Also save to bootcamp subcollection if student
    if (role === 'student' && bootcampId) {
      await dbAdmin.collection('bootcamps').doc(bootcampId).collection('students').doc(uid).set({
        ...userData,
        totalPoints: 0
      }, { merge: true });
    }

    return NextResponse.json({ success: true, uid, email }, { status: 201 });
  } catch (error) {
    console.error('Error creating participant:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid parameter' }, { status: 400 });
    }

    // Soft delete: mark deleted = true
    await dbAdmin.collection('users').doc(uid).update({
      deleted: true,
      deletedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error soft deleting user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

