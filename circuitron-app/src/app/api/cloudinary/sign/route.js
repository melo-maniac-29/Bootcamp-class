import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const data = await request.json();
    const { params } = data; // Object containing parameter keys like timestamp, folder, upload_preset

    if (!params || !params.timestamp) {
      return NextResponse.json({ error: 'Missing timestamp parameter' }, { status: 400 });
    }

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    // Fallback Mocking for Local Development (if credentials are not supplied yet)
    if (!apiSecret || !apiKey || !cloudName) {
      console.warn('Cloudinary environment variables not fully configured. Using mock signature.');
      return NextResponse.json({
        signature: 'mock_signature',
        timestamp: params.timestamp,
        apiKey: apiKey || 'mock_api_key',
        cloudName: cloudName || 'mock_cloud_name',
        isMock: true,
      });
    }

    // Sort parameters alphabetically (Cloudinary signing requirement)
    const sortedKeys = Object.keys(params).sort();
    const parameterString = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('&') + apiSecret;

    // Create SHA-1 hash signature
    const signature = crypto
      .createHash('sha1')
      .update(parameterString)
      .digest('hex');

    return NextResponse.json({
      signature,
      timestamp: params.timestamp,
      apiKey,
      cloudName,
      isMock: false,
    });
  } catch (error) {
    console.error('Cloudinary signature generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
