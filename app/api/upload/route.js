import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize the S3 Client using your .env.local variables
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  try {
    const { fileName, fileType } = await req.json();
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
    });

    // Generates a 1-hour secure upload link
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    
    return NextResponse.json({ signedUrl });
  } catch (err) {
    console.error("API UPLOAD ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}