import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import dotenv from 'dotenv'

dotenv.config()

console.log('Using AWS region:', process.env.AWS_REGION)

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || ''

export const generateUploadUrl = async (key: string, contentType: string): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType
  })
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })

  try {
    // Generate presigned URL valid for 5 minutes
    return signedUrl
  } catch (error) {
    console.error('Error generating upload URL:', error)
    throw new Error('Failed to generate upload URL')
  }
}

export const generateDownloadUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  })

  try {
    // Generate presigned URL valid for 5 minutes
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })
    return signedUrl
  } catch (error) {
    console.error('Error generating download URL:', error)
    throw new Error('Failed to generate download URL')
  }
}

export default {
  generateUploadUrl,
  generateDownloadUrl
}