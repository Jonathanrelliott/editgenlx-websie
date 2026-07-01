import { S3Client } from '@aws-sdk/client-s3';
import { fromStatic } from '@aws-sdk/credential-providers';

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: fromStatic({
    accessKeyId: process.env.R2_ACCESS_KEY.trim(),
    secretAccessKey: process.env.R2_SECRET_KEY.trim(),
  }),
});