import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types/index.js'
import { verifyToken } from '../utils/jwt.js'

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided'
      })
      return
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyToken(token)

    // Attach user to request
    req.user = {
      id: payload.userId,
      email: payload.email,
      subscriptionTier: payload.subscriptionTier
    }

    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    })
  }
}

/**
 * Premium subscription middleware
 * Checks if user has premium subscription
 */
export function requirePremium(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    })
    return
  }

  const isPremium = req.user.subscriptionTier === 'PREMIUM' || req.user.subscriptionTier === 'PREMIUM_PLUS'

  if (!isPremium) {
    res.status(403).json({
      success: false,
      error: 'Premium subscription required',
      upgradeUrl: '/premium'
    })
    return
  }

  next()
}

/**
 * Premium Plus subscription middleware
 */
export function requirePremiumPlus(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    })
    return
  }

  if (req.user.subscriptionTier !== 'PREMIUM_PLUS') {
    res.status(403).json({
      success: false,
      error: 'Premium Plus subscription required',
      upgradeUrl: '/premium-plus'
    })
    return
  }

  next()
}
