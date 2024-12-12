import { Router } from 'express'
import { prisma } from '../db/prisma'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { ZodError } from 'zod'
import { requireAuth } from '../middleware/auth'
import { z } from 'zod'

const router = Router()

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().optional()
})

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const result = signUpSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      })
    }

    const { email, password, name } = result.data

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name
      }
    })

    // Create session
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    })

    // Set cookie
    res.cookie('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt
    })

    res.json({
      id: user.id,
      email: user.email,
      name: user.name
    })
  } catch (err) {
    console.error('Sign up error:', err)
    if (err instanceof ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: err.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})



const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})
// Sign in
router.post('/signin', async (req, res) => {
  try {
    const result = signInSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      })
    }

    const { email, password } = result.data

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Create session
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    })

    // Set cookie
    res.cookie('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt
    })

    res.json({
      id: user.id,
      email: user.email,
      name: user.name
    })
  } catch (err) {
    console.error('Sign in error:', err)
    if (err instanceof ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: err.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Sign out
router.post('/signout', requireAuth, async (req, res) => {
  try {
    const token = req.cookies.session
    if (token) {
      await prisma.session.delete({
        where: { token }
      })
      res.clearCookie('session')
    }
    res.json({ message: 'Signed out successfully' })
  } catch (error) {
    console.error('Signout error:', error)
    res.status(500).json({ error: 'Failed to sign out' })
  }
})

// Get current user
router.get('/me', requireAuth, async (req, res) => {
  try {
    const token = req.cookies.session
    if (!token) {
      return res.json({ user: null })
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!session || session.expiresAt < new Date()) {
      res.clearCookie('session')
      return res.json({ user: null })
    }

    res.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      }
    })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({ error: 'Failed to get current user' })
  }
})

export default router
