import { Router } from 'express';
import { ResumeAnalyzer } from '../services/analysis/ResumeAnalyzer.js';
import { extractTextFromPDF } from '../utils/pdfExtractor.js';
import { extractTextFromDOCX } from '../utils/docxExtractor.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client } from '../lib/s3.js';
import { prisma } from '../lib/prisma.js';

const router = Router();
const s3Client = getS3Client();
const analyzer = new ResumeAnalyzer(process.env.GOOGLE_API_KEY || '');

// Helper function to download file from S3
async function downloadFromS3(fileKey: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME || '',
    Key: fileKey
  });

  const response = await s3Client.send(command);
  return streamToBuffer(response.Body);
}

// Helper function to convert stream to buffer
async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err: Error) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

// Helper function to store analysis results
async function storeAnalysisResults(resumeId: string, analysis: any): Promise<void> {
  await prisma.resume.update({
    where: { id: resumeId },
    data: { analysis },  // ✅ stores JSON directly
  });
}


// Helper function to get stored analysis
async function getStoredAnalysis(resumeId: string) {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId }
  });

  return resume?.analysis ?? null;
}


// Get or create analysis for a resume
router.get('/resume/:resumeId', async (req, res) => {
  try {
    const { resumeId } = req.params;
    console.log('Fetching/creating analysis for resume:', resumeId);

    // Try to get existing analysis first
    const existingAnalysis = await getStoredAnalysis(resumeId);
    if (existingAnalysis) {
      console.log('Returning existing analysis');
      return res.json({
        success: true,
        data: existingAnalysis
      });
    }

    // Get resume details from database
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId }
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    console.log('Downloading file from S3:', resume.fileKey);
    const fileBuffer = await downloadFromS3(resume.fileKey);

    // Extract text based on file type
    let resumeText;
    if (resume.fileType === 'application/pdf') {
      console.log('Extracting text from PDF');
      resumeText = await extractTextFromPDF(fileBuffer);
    } else if (resume.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('Extracting text from DOCX');
      resumeText = await extractTextFromDOCX(fileBuffer);
    } else {
      throw new Error('Unsupported file type: ' + resume.fileType);
    }

    console.log('Extracted text length:', resumeText.length);

    // Analyze resume
    console.log('Starting resume analysis');
    const analysis = await analyzer.analyzeResume(resumeText);
    console.log('Analysis complete');

    // Store analysis results
    await storeAnalysisResults(resumeId, analysis);
    console.log('Analysis stored in database');

    // Update resume with parsed text
    await prisma.resume.update({
      where: { id: resumeId },
      data: { parsedText: resumeText }
    });

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze resume'
    });
  }
});

export default router;