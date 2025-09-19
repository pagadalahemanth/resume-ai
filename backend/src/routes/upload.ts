import { Router } from 'express'
import { generateUploadUrl, generateDownloadUrl } from '../lib/s3.js'
import { prisma } from '../lib/prisma.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// Generate presigned URL for file upload
router.post('/upload-url', authenticateToken, async (req, res) => {
  try {
    console.log('Upload URL request received:', req.body);
     const { fileName, contentType } = req.body
     const userId = req.user?.id

     if (!fileName || !contentType || !userId) {
       console.error('Missing required fields:', { fileName, contentType, userId })
       return res.status(400).json({ error: 'Missing required fields' })
     }

     // Sanitize filename: replace spaces and special characters with underscores
     const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
     const key = `${userId}/${Date.now()}-${cleanFileName}`
     console.log('Generated file key:', key)

    // Generate presigned URL
    console.log('Generating presigned URL for:', { key, contentType });
    const uploadUrl = await generateUploadUrl(key, contentType);
    console.log('Generated presigned URL successfully');

    res.json({ uploadUrl, key });
  } catch (error) {
    console.error('Upload URL generation error:', error)
    res.status(500).json({ error: 'Failed to generate upload URL' })
  }
})

// Notify backend about successful upload
router.post('/notify-upload', authenticateToken, async (req, res) => {
  try {
    console.log('Upload notification received:', req.body);
    const { key, fileName, fileSize, fileType } = req.body;
    const userId = req.user?.id;

    if (!key || !userId) {
      console.error('Missing required fields:', { key, userId });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Creating resume record in database...', {
      userId,
      fileName,
      key,
      fileSize,
      fileType
    });

    // Create resume record in database
    const resume = await prisma.resume.create({
      data: {
        userId,
        fileName,
        fileKey: key,
        fileSize,
        fileType
      }
    });

    console.log('Resume record created successfully:', resume);
    res.json({ resume });
  } catch (error) {
    console.error('Upload notification error:', error)
    res.status(500).json({ error: 'Failed to process upload notification' })
  }
})

// Get download URL for a file
router.get('/download-url/:key', authenticateToken, async (req, res) => {
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

    const downloadUrl = await generateDownloadUrl(key)
    res.json({ downloadUrl })
  } catch (error) {
    console.error('Download URL generation error:', error)
    res.status(500).json({ error: 'Failed to generate download URL' })
  }
})

// Health check endpoint for S3 connectivity
router.get('/health', async (req, res) => {
  try {
    // Try generating a test presigned URL
    const testKey = `test-${Date.now()}.txt`;
    const uploadUrl = await generateUploadUrl(testKey, 'text/plain');
    res.json({
      status: 'ok',
      s3Connected: true,
      message: 'S3 service is working correctly'
    });
  } catch (error) {
    console.error('S3 health check failed:', error);
    res.status(500).json({
      status: 'error',
      s3Connected: false,
      message: 'Failed to connect to S3 service',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router
