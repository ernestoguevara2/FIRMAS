# FIRMAS Backend API

Backend REST API for FIRMAS - Signature Personality Analysis Platform

## 🏗️ Tech Stack

- **Node.js** + **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM for PostgreSQL
- **PostgreSQL** - Database
- **Stripe** - Payment processing
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── controllers/           # Request handlers
│   │   ├── authController.ts
│   │   └── stripeController.ts
│   ├── middleware/            # Express middleware
│   │   └── auth.ts
│   ├── routes/                # API routes
│   │   ├── authRoutes.ts
│   │   └── stripeRoutes.ts
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   ├── utils/                 # Utilities
│   │   ├── db.ts              # Prisma client
│   │   └── jwt.ts             # JWT utilities
│   └── index.ts               # Main server file
├── .env.example               # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

- **DATABASE_URL**: PostgreSQL connection string
- **JWT_SECRET**: Secret key for JWT tokens (use a strong random string)
- **STRIPE_SECRET_KEY**: Get from [Stripe Dashboard](https://dashboard.stripe.com/)
- **STRIPE_WEBHOOK_SECRET**: Create webhook endpoint in Stripe
- **GEMINI_API_KEY**: Get from [Google AI Studio](https://aistudio.google.com/)

### 3. Setup Database

#### Using Docker (Recommended)

```bash
docker run --name firmas-postgres -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=firmas_db -p 5432:5432 -d postgres:16
```

#### Or install PostgreSQL locally

- macOS: `brew install postgresql`
- Ubuntu: `sudo apt-get install postgresql`
- Windows: Download from [postgresql.org](https://www.postgresql.org/download/)

### 4. Run Prisma Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. (Optional) Open Prisma Studio

View and edit your database:

```bash
npm run prisma:studio
```

### 6. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Create new user account | No |
| POST | `/api/auth/login` | Login with email/password | No |
| GET | `/api/auth/me` | Get current user info | Yes |

**Signup Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "subscriptionTier": "FREE"
    },
    "token": "jwt_token_here"
  }
}
```

### Stripe / Subscriptions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/stripe/create-checkout-session` | Create Stripe checkout | Yes |
| POST | `/api/stripe/create-portal-session` | Create billing portal session | Yes |
| GET | `/api/stripe/subscription-status` | Get subscription status | Yes |
| POST | `/api/stripe/webhook` | Stripe webhook handler | No (Stripe signature) |

**Create Checkout Session Request:**
```json
{
  "priceId": "price_1234567890",
  "successUrl": "http://localhost:5173/premium/success",
  "cancelUrl": "http://localhost:5173/premium/canceled"
}
```

**Create Portal Session Request:**
```json
{
  "returnUrl": "http://localhost:5173/account"
}
```

### Authentication Headers

For protected routes, include JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🔐 Stripe Setup

### 1. Create Stripe Account

Sign up at [stripe.com](https://stripe.com)

### 2. Create Products and Prices

In Stripe Dashboard:

1. Go to **Products** → **Add Product**
2. Create products:
   - **FIRMAS Premium** ($9.99/month, $79.99/year)
   - **FIRMAS Premium Plus** ($19.99/month, $149.99/year)
3. Copy Price IDs and add to `.env`

### 3. Setup Webhook

1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret to `.env`

## 🗄️ Database Models

### User
- id, email, password, name
- subscriptionTier (FREE, PREMIUM, PREMIUM_PLUS)
- subscriptionStatus, stripeCustomerId, stripeSubscriptionId
- trialEndsAt, subscriptionEndsAt

### SignatureAnalysis
- id, userId, signatureImageUrl
- analysisData (JSON - all 20 characteristics)
- analysisType (BASIC, PROFESSIONAL)

### CompatibilityAnalysis
- id, userId, partnerSignatureUrl, partnerName
- compatibilityScore, compatibilityData (JSON)

### GeneratedSignature
- id, userId, userName
- personalityInput (JSON), generatedImages (JSON)
- generationCount

### PdfReport
- id, userId, analysisId, pdfUrl
- reportType (PROFESSIONAL, COMPATIBILITY)

### Referral
- id, referrerId, referredEmail, referredUserId
- referralCode, status, rewardGranted

### UsageTracking
- id, userId, month
- analysisCount, aiGenerationCount, compatibilityCount

## 📝 Scripts

```bash
npm run dev          # Start development server (with hot reload)
npm run build        # Compile TypeScript to JavaScript
npm run start        # Start production server
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio
```

## 🚀 Deployment

### Railway (Recommended)

1. Create account at [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Add your backend service
5. Set environment variables
6. Deploy!

### Render

1. Create account at [render.com](https://render.com)
2. Create PostgreSQL database
3. Create Web Service
4. Connect GitHub repo
5. Set environment variables
6. Deploy!

### Environment Variables for Production

Make sure to set ALL environment variables from `.env.example` in your hosting platform.

**IMPORTANT:** Change `JWT_SECRET` to a strong random string in production!

## 🔒 Security Notes

- **Never commit `.env` file** - it contains sensitive secrets
- **Change JWT_SECRET** in production to a strong random string
- **Use HTTPS** in production
- **Enable Stripe webhook signature verification** (already implemented)
- **Rate limiting** - TODO: Add rate limiting middleware for production

## 📚 Next Steps

After backend is running:

1. Create Stripe products and get price IDs
2. Setup Gemini API for AI signature generator
3. Setup Cloudinary for image storage
4. Implement remaining controllers:
   - Signature analysis controller
   - Compatibility analysis controller
   - AI generator controller
   - PDF generation controller
5. Add rate limiting middleware
6. Add input validation for all endpoints
7. Add comprehensive error logging (Sentry)

## 🆘 Troubleshooting

### "Cannot find module" errors
```bash
npm install
npm run prisma:generate
```

### Database connection errors
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify credentials are correct

### Stripe webhook errors
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3001/api/stripe/webhook`
- Check webhook secret matches `.env`

## 📞 Support

For issues or questions, check:
- [Documentation](../Docs/)
- [GitHub Issues](https://github.com/your-repo/issues)

---

Built with ❤️ for FIRMAS
