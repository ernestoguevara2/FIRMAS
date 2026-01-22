import { Router } from 'express'
import {
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
  handleWebhook
} from '../controllers/stripeController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Webhook route (no authentication, Stripe signature verification instead)
// IMPORTANT: Must be defined before other routes and use raw body
router.post('/webhook', handleWebhook)

// Protected routes
router.post('/create-checkout-session', authenticate, createCheckoutSession)
router.post('/create-portal-session', authenticate, createPortalSession)
router.get('/subscription-status', authenticate, getSubscriptionStatus)

export default router
