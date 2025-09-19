import { S3Client, PutBucketCorsCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: [
        "*"
      ],
      AllowedMethods: [
        "PUT",
        "GET",
        "POST"
      ],
      AllowedOrigins: [
        process.env.FRONTEND_URL || "http://localhost:5173"
      ],
      ExposeHeaders: [
        "ETag",
        "x-amz-checksum-crc32"
      ],
      MaxAgeSeconds: 3600
    }
  ]
};

const bucketPolicy = {
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "AllowPutObject",
      Effect: "Allow",
      Principal: "*",
      Action: [
        "s3:PutObject",
        "s3:GetObject"
      ],
      Resource: `arn:aws:s3:::${BUCKET_NAME}/*`,
      Condition: {
        StringEquals: {
          "aws:UserAgent": "axios"
        }
      }
    }
  ]
};

async function configureBucket() {
  try {
    // Set CORS configuration
    await s3Client.send(new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsConfiguration
    }));
    console.log('CORS configuration updated successfully');

    // Set bucket policy
    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy)
    }));
    console.log('Bucket policy updated successfully');

  } catch (error) {
    console.error('Error configuring bucket:', error);
  }
}

configureBucket();