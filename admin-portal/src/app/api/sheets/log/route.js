import { NextResponse } from 'next/server';
import { authAdmin } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const payload = await request.json();
    const { type, data } = payload;

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
    }

    // Verify token if available in headers (for security)
    const authHeader = request.headers.get('Authorization');
    let authenticatedUser = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        authenticatedUser = await authAdmin.verifyIdToken(token);
      } catch (err) {
        console.warn('Token verification failed:', err.message);
      }
    }

    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    
    // Standardize IST Timestamp
    const timestampIST = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

    const logPayload = {
      type,
      timestamp: timestampIST,
      data: {
        ...data,
        syncedBy: authenticatedUser ? authenticatedUser.uid : 'system',
      }
    };

    console.log(`[Google Sheets Log] Event: ${type}`, logPayload);

    if (webhookUrl) {
      try {
        // Post to Google Apps Script Webhook
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logPayload),
        });

        if (!response.ok) {
          console.error('Google Sheets webhook returned error status:', response.status);
        }
      } catch (err) {
        // Failure Handling: log to console, but don't fail the API call for the user
        console.error('Google Sheets webhook sync failed (network error):', err.message);
      }
    } else {
      console.info('GOOGLE_SHEETS_WEBHOOK_URL env variable not set. Logging event to console only.');
    }

    return NextResponse.json({ success: true, timestamp: timestampIST });
  } catch (error) {
    console.error('Google Sheets log API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
