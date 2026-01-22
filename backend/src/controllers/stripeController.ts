import { Response } from 'express'
import Stripe from 'stripe'
import { AuthRequest } from '../types/index.js'
import prisma from '../utils/db.js'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
})

// Price IDs (set these in your environment variables)
const PREMIUM_MONTHLY_PRICE_ID = process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || ''
const PREMIUM_YEARLY_PRICE_ID = process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || ''
const PREMIUM_PLUS_MONTHLY_PRICE_ID = process.env.STRIPE_PREMIUM_PLUS_MONTHLY_PRICE_ID || ''
const PREMIUM_PLUS_YEARLY_PRICE_ID = process.env.STRIPE_PREMIUM_PLUS_YEARLY_PRICE_ID || ''

/**
 * Create Stripe Checkout Session
 */
export async function createCheckoutSession(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' })
      return
    }

    const { priceId, successUrl, cancelUrl } = req.body

    // Validate priceId
    const validPriceIds = [
      PREMIUM_MONTHLY_PRICE_ID,
      PREMIUM_YEARLY_PRICE_ID,
      PREMIUM_PLUS_MONTHLY_PRICE_ID,
      PREMIUM_PLUS_YEARLY_PRICE_ID
    ]

    if (!validPriceIds.includes(priceId)) {
      res.status(400).json({ success: false, error: 'Invalid price ID' })
      return
    }

    // Get or create Stripe customer
    let customerId = ''

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' })
      return
    }

    if (user.stripeCustomerId) {
      customerId = user.stripeCustomerId
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id
        }
      })
      customerId = customer.id

      // Save customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        trial_period_days: 7, // 7-day free trial
        metadata: {
          userId: user.id
        }
      },
      metadata: {
        userId: user.id
      }
    })

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    })
  } catch (error) {
    console.error('Create checkout session error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session'
    })
  }
}

/**
 * Create Stripe Customer Portal Session
 */
export async function createPortalSession(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' })
      return
    }

    const { returnUrl } = req.body

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })

    if (!user || !user.stripeCustomerId) {
      res.status(400).json({
        success: false,
        error: 'No active subscription found'
      })
      return
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl
    })

    res.json({
      success: true,
      data: {
        url: session.url
      }
    })
  } catch (error) {
    console.error('Create portal session error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create portal session'
    })
  }
}

/**
 * Get subscription status
 */
export async function getSubscriptionStatus(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
        stripeSubscriptionId: true
      }
    })

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' })
      return
    }

    let subscriptionDetails = null

    // If has active Stripe subscription, get details
    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
        subscriptionDetails = {
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          status: subscription.status
        }
      } catch (error) {
        console.error('Error retrieving subscription:', error)
      }
    }

    // Check trial status
    const now = new Date()
    const isTrialActive = user.trialEndsAt ? user.trialEndsAt > now : false

    res.json({
      success: true,
      data: {
        tier: user.subscriptionTier,
        status: user.subscriptionStatus,
        isTrialActive,
        trialEndsAt: user.trialEndsAt,
        subscriptionEndsAt: user.subscriptionEndsAt,
        subscriptionDetails
      }
    })
  } catch (error) {
    console.error('Get subscription status error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

/**
 * Stripe Webhook Handler
 */
export async function handleWebhook(req: any, res: Response) {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    res.status(400).send(`Webhook Error: ${error.message}`)
    return
  }

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    res.status(500).json({ error: 'Webhook handler failed' })
  }
}

/**
 * Handle checkout completed
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId

  if (!userId) {
    console.error('No userId in checkout session metadata')
    return
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      subscriptionStatus: 'TRIALING' // They start with trial
    }
  })
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('No userId in subscription metadata')
    return
  }

  // Determine tier based on price ID
  let tier = 'PREMIUM'
  const priceId = subscription.items.data[0]?.price.id

  if (priceId === PREMIUM_PLUS_MONTHLY_PRICE_ID || priceId === PREMIUM_PLUS_YEARLY_PRICE_ID) {
    tier = 'PREMIUM_PLUS'
  }

  // Determine status
  let status = 'ACTIVE'
  if (subscription.status === 'trialing') status = 'TRIALING'
  else if (subscription.status === 'past_due') status = 'PAST_DUE'
  else if (subscription.status === 'canceled') status = 'CANCELED'

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier,
      subscriptionStatus: status,
      stripeSubscriptionId: subscription.id,
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000)
    }
  })
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('No userId in subscription metadata')
    return
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: 'FREE',
      subscriptionStatus: 'CANCELED',
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000)
    }
  })
}

/**
 * Handle payment succeeded
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Payment succeeded - subscription should already be updated via subscription.updated event
  console.log(`Payment succeeded for invoice ${invoice.id}`)
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'PAST_DUE'
      }
    })

    // TODO: Send email notification about failed payment
    console.log(`Payment failed for user ${user.email}`)
  }
}
