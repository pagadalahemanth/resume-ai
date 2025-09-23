import { Router } from 'express'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import jwt from 'jsonwebtoken'
// import { PrismaClient } from '@prisma/client'
import { PrismaClient } from '../../generated/prisma/index.js'

const prisma = new PrismaClient();

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// Google OAuth2 configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "http://localhost:3000/auth/google/callback",
  scope: ['email', 'profile']
}, async (accessToken, refreshToken, profile, done) => {
  console.log('Google OAuth callback received:', { 
    id: profile.id,
    email: profile.emails?.[0]?.value,
    name: profile.displayName
  });

  try {
    // Check if database is connected
    await prisma.$queryRaw`SELECT 1`
    console.log('Database connection successful');

    const user = await prisma.user.upsert({
      where: {
        googleId: profile.id,
      },
      update: {
        email: profile.emails?.[0]?.value || '',
        name: profile.displayName,
        picture: profile.photos?.[0]?.value || null,
      },
      create: {
        email: profile.emails?.[0]?.value || '',
        googleId: profile.id,
        name: profile.displayName,
        picture: profile.photos?.[0]?.value || null,
      },
    })

    console.log('User upserted successfully:', { id: user.id, email: user.email });
    return done(null, user)
  } catch (error) {
    console.error('OAuth error:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    return done(error as Error)
  }
}))

// Serialize user for the session
passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    })
    done(null, user)
  } catch (error) {
    done(error)
  }
})

// Start OAuth flow
router.get('/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
)

// OAuth callback
router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) => {
      if (err) {
        console.error('OAuth Error:', err);
        return res.redirect(`${FRONTEND_URL}/auth/error?message=${encodeURIComponent(err.message)}`);
      }
      if (!user) {
        console.error('No user found');
        return res.redirect(`${FRONTEND_URL}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
      }
      try {
        const token = jwt.sign({ id: user.id }, JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
        res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
      } catch (error) {
        console.error('Token Generation Error:', error);
        res.redirect(`${FRONTEND_URL}/auth/error?message=${encodeURIComponent('Failed to generate authentication token')}`);
      }
    })(req, res, next);
  }
)

// Get current user
router.get('/status', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET!) as unknown as { id: string }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

// Logout
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' })
  })
})

export default router