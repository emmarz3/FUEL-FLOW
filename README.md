# FuelFlow Africa - Automated Fuel Management Platform

A subscription-based fuel management and recurring fuel delivery platform powered by the Nomba Payments API.

## Features

- **Automated Fuel Orders**: Set up recurring fuel subscriptions and never run out again
- **Scheduled Deliveries**: Choose your delivery frequency - weekly, bi-weekly, monthly, or quarterly
- **Secure Payments**: Powered by Nomba for secure, tokenized card payments
- **Smart Analytics**: Track consumption, spending, and get predictive insights
- **Payment Recovery Engine**: Automatic retry logic for failed payments
- **Webhook Integration**: Real-time payment event handling

## Technology Stack

### Frontend
- Next.js 13 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Hook Form
- Zod
- TanStack Query
- Chart.js

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB (Mongoose)
- Redis (BullMQ)
- JWT Authentication
- bcrypt
- Cloudinary
- Nodemailer

## Project Structure

```
fuelflow-africa/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App Router pages
│   │   ├── auth/            # Authentication pages
│   │   ├── customer/        # Customer dashboard
│   │   ├── vendor/          # Vendor dashboard
│   │   ├── driver/          # Driver dashboard
│   │   └── admin/           # Admin dashboard
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions
│   ├── styles/              # Global styles
│   └── types/               # TypeScript types
│
├── backend/                  # Express.js backend API
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # Utility functions
│   │   └── jobs/            # Background jobs
│   └── tests/               # Test files
│
├── docs/                    # Documentation
└── .env.example             # Environment variables template
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas account
- Redis instance
- Nomba Developer Account

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-org/fuelflow-africa.git
cd fuelflow-africa
```

2. Install dependencies
```bash
npm install
npm run install --workspaces
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Configure MongoDB Atlas
- Create a MongoDB Atlas cluster
- Add your IP to the whitelist
- Get the connection string

5. Configure Nomba API
- Get your Nomba API keys from the developer dashboard
- Set up webhook endpoint URL

6. Start the development servers
```bash
# Terminal 1: Backend
npm run dev --workspace=backend

# Terminal 2: Frontend
npm run dev --workspace=frontend
```

## API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `PATCH /api/v1/auth/reset-password/:token` - Reset password

### Subscription Endpoints
- `POST /api/v1/subscriptions` - Create subscription
- `GET /api/v1/subscriptions` - Get user subscriptions
- `GET /api/v1/subscriptions/:id` - Get subscription details
- `PATCH /api/v1/subscriptions/:id/pause` - Pause subscription
- `PATCH /api/v1/subscriptions/:id/resume` - Resume subscription
- `PATCH /api/v1/subscriptions/:id/cancel` - Cancel subscription
- `PATCH /api/v1/subscriptions/:id/upgrade` - Upgrade subscription
- `PATCH /api/v1/subscriptions/:id/downgrade` - Downgrade subscription

### Payment Endpoints
- `POST /api/v1/payments` - Create payment
- `GET /api/v1/payments/history` - Get payment history
- `GET /api/v1/payments/:id` - Get payment details
- `GET /api/v1/payments/verify/:chargeId` - Verify payment
- `POST /api/v1/payments/:id/refund` - Refund payment

### Card Endpoints
- `POST /api/v1/cards` - Save card
- `GET /api/v1/cards` - Get user cards
- `DELETE /api/v1/cards/:id` - Delete card
- `PATCH /api/v1/cards/:id/default` - Set as default

### Webhook Endpoints
- `POST /api/v1/webhooks/nomba` - Nomba webhook handler
- `GET /api/v1/webhooks` - Get webhook logs
- `GET /api/v1/webhooks/:id` - Get webhook log

## Nomba Integration

FuelFlow Africa integrates with Nomba's payment APIs:

### Checkout API
Used for initial subscription payments and one-time orders.

### Tokenized Cards
Securely save customer cards for recurring payments.

### Charge API
Process recurring subscription charges automatically.

### Webhooks
Real-time event handling for:
- Payment success/failure
- Subscription lifecycle events
- Card expiration/declined events
- Refund events

### Payment Recovery Engine
Handles failed payments with:
- Automatic retry logic (24h, 72h)
- Subscription suspension
- Customer notifications
- Card replacement flow

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Backend (Railway/Render)
1. Create a new service
2. Set build command: `npm run build --workspace=backend`
3. Set start command: `npm run start --workspace=backend`
4. Configure environment variables

### Database (MongoDB Atlas)
1. Create a cluster
2. Configure network access
3. Get connection string

## Environment Variables

See `.env.example` for all required configuration:
- Application settings
- JWT secrets
- MongoDB connection
- Redis connection
- Cloudinary credentials
- Email provider
- Nomba credentials
- Webhook secret

## Development

### Running Tests
```bash
npm run test --workspace=backend
```

### Running Linter
```bash
npm run lint --workspace=backend
npm run lint --workspace=frontend
```

### Building
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Nomba API](https://nomba.dev/)
