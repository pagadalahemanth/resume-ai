import { Router } from 'express'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { authenticateToken } from '../middleware/auth.js'
import { prisma } from '../lib/prisma.js'

const router = Router()

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

// Generate download URL
router.get('/download/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params
    const userId = req.user?.id

    // Verify file ownership
    const resume = await prisma.resume.findFirst({
      where: {
        fileKey: key,
        userId
      }
    })

    if (!resume) {
      return res.status(404).json({ error: 'File not found' })
    }

    // Generate presigned URL for download
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }) // URL expires in 1 hour

    res.json({
      downloadUrl: signedUrl,
      fileName: resume.fileName,
      fileType: resume.fileType
    })
  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({ error: 'Failed to generate download URL' })
  }
})

// Get all user's files
router.get('/files', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id

    const files = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        fileKey: true,
        fileType: true,
        createdAt: true,
        reviews: {
          select: {
            id: true,
            overallScore: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    res.json({ files })
  } catch (error) {
    console.error('List files error:', error)
    res.status(500).json({ error: 'Failed to list files' })
  }
})

export default router