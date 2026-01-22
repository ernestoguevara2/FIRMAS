import { Request } from 'express'
import { User } from '@prisma/client'

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    subscriptionTier: string
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Auth types
export interface SignupRequest {
  email: string
  password: string
  name?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    name?: string
    subscriptionTier: string
  }
  token: string
}

// Signature Analysis types
export interface AnalyzeSignatureRequest {
  signatureDataUrl: string
  analysisType?: 'BASIC' | 'PROFESSIONAL'
}

export interface SignatureAnalysisResponse {
  id: string
  characteristics: any // From analyzer
  profile: any
  archetype: any
  timestamp: string
}

// Compatibility Analysis types
export interface CompatibilityAnalysisRequest {
  partnerSignatureUrl: string
  partnerName?: string
}

export interface CompatibilityAnalysisResponse {
  id: string
  compatibilityScore: number
  dimensions: any
  strengths: string[]
  challenges: string[]
  recommendations: string[]
}

// AI Generator types
export interface GenerateSignatureRequest {
  userName: string
  personalityInput: {
    professionalism: number
    energy: number
    style: number
    projection: number
    innovation: number
    character: number
  }
  visualPreferences: {
    strokeStyle: string
    thickness: string
    inclination: string
    decorative: string
  }
}

export interface GenerateSignatureResponse {
  id: string
  images: string[]
  analysis: any
  remainingQuota: number
}

// Stripe types
export interface CreateCheckoutSessionRequest {
  priceId: string
  successUrl: string
  cancelUrl: string
}

export interface CreatePortalSessionRequest {
  returnUrl: string
}

export interface StripeWebhookEvent {
  type: string
  data: any
}

// PDF Report types
export interface GeneratePdfRequest {
  analysisId: string
  reportType: 'PROFESSIONAL' | 'COMPATIBILITY'
}

export interface GeneratePdfResponse {
  pdfUrl: string
  reportId: string
}

// Usage quota types
export interface UsageQuota {
  analysisCount: number
  aiGenerationCount: number
  compatibilityCount: number
  limits: {
    analysisLimit: number
    aiGenerationLimit: number
    compatibilityLimit: number
  }
  remaining: {
    analysis: number
    aiGeneration: number
    compatibility: number
  }
}
