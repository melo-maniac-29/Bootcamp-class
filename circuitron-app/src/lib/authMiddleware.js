import { NextResponse } from 'next/server';
import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';

/**
 * Verifies the Firebase Auth token from the Authorization header
 * and looks up the user's role from Firestore.
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<{uid: string, email: string, role: string} | Response>}
 *   Returns user info on success, or a NextResponse with 401 status on failure.
 */
export async function verifyAuth(request) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    if (!authAdmin) {
      console.error('Firebase Admin Auth is not initialized');
      return NextResponse.json(
        { error: 'Server authentication not configured' },
        { status: 401 }
      );
    }

    const decodedToken = await authAdmin.verifyIdToken(token);
    const { uid, email } = decodedToken;

    // Look up the user doc to get their role
    const userDoc = await dbAdmin.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 401 }
      );
    }

    const userData = userDoc.data();
    return { uid, email: email || userData.email, role: userData.role };
  } catch (error) {
    console.error('Auth verification failed:', error.message);
    return NextResponse.json(
      { error: 'Invalid or expired authentication token' },
      { status: 401 }
    );
  }
}

/**
 * Requires admin role. Calls verifyAuth and checks that the user's role is 'admin'.
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<{uid: string, email: string, role: string} | Response>}
 *   Returns user info on success, or a NextResponse with 401/403 status on failure.
 */
export async function requireAdmin(request) {
  const authResult = await verifyAuth(request);

  // If verifyAuth returned a Response, pass it through (auth failed)
  if (authResult instanceof Response) {
    return authResult;
  }

  if (authResult.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden: admin access required' },
      { status: 403 }
    );
  }

  return authResult;
}
