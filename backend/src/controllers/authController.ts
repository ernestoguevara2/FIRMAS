import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '../utils/db.js'
import { generateToken } from '../utils/jwt.js'
import { AuthRequest, SignupRequest, LoginRequest, AuthResponse } from '../types/index.js'

// Validation schemas
const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
})

/**
 * User Signup
 */
export async function signup(req: Request<{}, {}, SignupRequest>, res: Response) {
  try {
    // Validate request body
    const validatedData = signupSchema.parse(req.body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      })
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create user with free tier and trial
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        subscriptionTier: 'FREE',
        // 7-day trial for premium features
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier
    })

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        subscriptionTier: user.subscriptionTier
      },
      token
    }

    res.status(201).json({
      success: true,
      data: response
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: error.errors[0].message
      })
      return
    }

    console.error('Signup error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

/**
 * User Login
 */
export async function login(req: Request<{}, {}, LoginRequest>, res: Response) {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
      return
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password)

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
      return
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier
    })

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        subscriptionTier: user.subscriptionTier
      },
      token
    }

    res.json({
      success: true,
      data: response
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: error.errors[0].message
      })
      return
    }

    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated'
      })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
        createdAt: true
      }
    })

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    // Check if trial has expired
    const now = new Date()
    const isTrialActive = user.trialEndsAt && user.trialEndsAt > now
    const isPremium = user.subscriptionTier !== 'FREE' || isTrialActive

    res.json({
      success: true,
      data: {
        ...user,
        isPremium,
        isTrialActive
      }
    })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
