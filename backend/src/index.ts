import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import * as dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import filesRoutes from './routes/files.js';
import analysisRoutes from './routes/analysis.js';

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Vercel
}))

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://your-app-name.vercel.app', // Replace with your actual Vercel domain
    /\.vercel\.app$/ // Allow all Vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Session configuration for Vercel
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}))

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

// Routes with /api prefix for Vercel
app.use('/api/auth', authRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/files', filesRoutes)
app.use('/api/analysis', analysisRoutes)

// Health check for Vercel
app.get('/api/health', (req, res) => {
  const envCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    config: {
      database: !!process.env.DATABASE_URL,
      aws: {
        region: !!process.env.AWS_REGION,
        credentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
        bucket: !!process.env.S3_BUCKET_NAME
      },
      google: {
        apiKey: !!process.env.GOOGLE_API_KEY,
        oauth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
      },
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173'
      }
    }
  };
  
  res.json(envCheck);
})

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  })
})

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// For Vercel serverless functions
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
    console.log(`Health check: http://localhost:${port}/api/health`)
  })
}