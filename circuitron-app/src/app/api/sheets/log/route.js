import { NextResponse } from 'next/server';
import { appendToSheet } from '@/lib/sheets';
import { verifyAuth } from '@/lib/authMiddleware';

export async function POST(request) {
  const authResult = await verifyAuth(request);
  if (authResult instanceof Response) return authResult;

  try {
    const payload = await request.json();
    const { tabName, data } = payload;

    if (!tabName || !data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Missing tabName or valid data array' }, { status: 400 });
    }

    // Standardize IST Timestamp as the first column, appending the rest of the data
    const timestampIST = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    
    // Default format: [Timestamp, UserID, ...restOfData]
    const rowData = [timestampIST, authResult.uid, ...data];

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

