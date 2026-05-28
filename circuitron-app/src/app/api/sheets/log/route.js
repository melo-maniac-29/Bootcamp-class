import { NextResponse } from 'next/server';
import { authAdmin } from '@/lib/firebaseAdmin';
import { appendToSheet } from '@/lib/sheets';

export async function POST(request) {
  try {
    const payload = await request.json();
    const { tabName, data } = payload;

    if (!tabName || !data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Missing tabName or valid data array' }, { status: 400 });
    }

    // Verify token if available in headers (for security)
    const authHeader = request.headers.get('Authorization');
    let authenticatedUser = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        authenticatedUser = await authAdmin?.verifyIdToken(token);
      } catch (err) {
        console.warn('Token verification failed:', err.message);
      }
    }

    // Standardize IST Timestamp as the first column, appending the rest of the data
    const timestampIST = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    
    // Default format: [Timestamp, UserID, ...restOfData]
    const userId = authenticatedUser ? authenticatedUser.uid : 'system';
    const rowData = [timestampIST, userId, ...data];

    console.log(`[Google Sheets Log] Writing to ${tabName}`);

    const result = await appendToSheet(tabName, rowData);

    if (result.success === false && result.reason === 'unconfigured') {
      console.info('Google Sheets env variables not set. Logging event to console only.', rowData);
    }

    return NextResponse.json({ success: true, timestamp: timestampIST });
  } catch (error) {
    console.error('Google Sheets log API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
