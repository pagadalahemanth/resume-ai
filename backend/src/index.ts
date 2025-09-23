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
const port = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use('/auth', authRoutes)
app.use('/upload', uploadRoutes)
app.use('/files', filesRoutes)
app.use('/analysis', analysisRoutes)

// Health check
app.get('/health', (req, res) => {
  const envCheck = {
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    config: {
      aws: {
        region: !!process.env.AWS_REGION,
        credentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
        bucket: !!process.env.S3_BUCKET_NAME
      },
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173'
      }
    }
  };
  
  res.json(envCheck);
})

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// Start server and log registered routes after everything is set up
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
  
  // Now log the registered routes after the server is fully initialized
  console.log('Registered routes:');
  if (app._router && app._router.stack) {
    app._router.stack.forEach((r: any) => {
      if (r.route && r.route.path) {
        console.log(`${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
      } else if (r.name === 'router') {
        // This handles route groups (like /auth/*, /upload/*, etc.)
        r.handle.stack.forEach((nestedRoute: any) => {
          if (nestedRoute.route) {
            const basePath = r.regexp.source
              .replace('\\', '')
              .replace('(?=\\/|$)', '')
              .replace('^', '')
              .replace('/i', '');
            console.log(`${Object.keys(nestedRoute.route.methods).join(',').toUpperCase()} ${basePath}${nestedRoute.route.path}`);
          }
        });
      }
    });
  }
})