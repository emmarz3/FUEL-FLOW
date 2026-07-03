# FuelFlow Africa - Architecture Documentation

## System Architecture

FuelFlow Africa follows Clean Architecture principles with a layered approach.

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                    Next.js Frontend (React)                       │
│  - App Router (pages/layouts)                                   │
│  - React Components (Shadcn UI)                                 │
│  - State Management (TanStack Query, React Hooks)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                    Express.js API Server                        │
│  - Routes (RESTful endpoints)                                   │
│  - Controllers (Request handling)                               │
│  - Middleware (Auth, Validation, Error handling)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DOMAIN LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                    Business Logic Services                      │
│  - Auth Service (JWT, Password hashing)                         │
│  - Payment Service (Nomba integration)                          │
│  - Subscription Service (Billing logic)                         │
│  - Delivery Service (Order management)                          │
│  - Analytics Service (Data processing)                          │
│  - Notification Service (Email/SMS/WhatsApp)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA ACCESS LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                    MongoDB/Mongoose Models                      │
│  - User, Role, Subscription, Payment, Card                      │
│  - Delivery, FuelOrder, Vendor, Driver                            │
│  - WebhookLog, Analytics, Notification                          │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### User Registration Flow
1. User submits registration form
2. Frontend validates input with Zod
3. API receives request, validates with Joi
4. User document created in MongoDB
5. JWT tokens generated
6. Response sent to frontend

### Payment Flow
1. User creates subscription
2. Frontend calls Create Payment endpoint
3. Backend creates payment record
4. Nomba Charge API called with card token
5. Payment status updated based on response
6. Webhook sent to Nomba
7. Nomba webhook received and processed
8. Payment recovery engine monitors status

### Subscription Lifecycle
1. Customer creates subscription
2. Initial payment processed
3. Subscription created in Nomba
4. Recurring charges scheduled
5. On payment success: Delivery created
6. On payment failure: Retry logic triggered
7. On card expiration: Customer notified
8. On subscription pause/cancel: Status updated

## Key Components

### 1. Authentication System
- JWT-based authentication
- Refresh token rotation
- Password hashing with bcrypt
- Role-based access control
- Failed login attempt tracking

### 2. Payment Integration (Nomba)
- Checkout API for initial payments
- Tokenized Cards for recurring billing
- Charge API for subscription charges
- Webhook verification with HMAC signatures
- Payment recovery engine with retry logic

### 3. Subscription Management
- Multiple plan types (weekly, bi-weekly, monthly, quarterly)
- Pause/Resume/Cancel operations
- Auto-renewal configuration
- Subscription status tracking

### 4. Delivery System
- Order creation and tracking
- Vendor assignment
- Driver assignment
- Real-time status updates
- Proof of delivery

### 5. Webhook Engine
- Secure endpoint with signature verification
- Event processing queue
- Retry mechanism for failed webhooks
- Comprehensive logging
- Replay capability

### 6. Analytics Engine
- Fuel consumption tracking
- Revenue analytics
- Subscription metrics
- Delivery performance
- Predictive modeling

## Design Patterns

### Repository Pattern
All database operations go through repository interfaces, allowing for easy testing and future database changes.

### Service Layer
Business logic is encapsulated in services, keeping controllers thin and focused on HTTP concerns.

### Middleware Pattern
Cross-cutting concerns (auth, validation, logging) are handled by middleware.

### Factory Pattern
Used for creating different types of subscriptions and deliveries.

## Security Considerations

1. **Password Security**: Bcrypt with 12 rounds
2. **JWT Security**: Short-lived access tokens, rotating refresh tokens
3. **Input Validation**: Zod/Joi for all inputs
4. **Rate Limiting**: Express-rate-limit middleware
5. **CORS**: Configured for allowed origins
6. **Helmet**: Security headers
7. **Webhook Verification**: HMAC signature validation
8. **Audit Logging**: All sensitive operations logged

## Scalability

1. **Horizontal Scaling**: Stateless API servers
2. **Database**: MongoDB Atlas with auto-scaling
3. **Caching**: Redis for sessions and caching
4. **Queue**: BullMQ for background jobs
5. **Load Balancing**: CDN for static assets

## Error Handling

1. **Global Error Handler**: Catches all unhandled errors
2. **Async Error Wrapper**: Handles async errors
3. **Custom Error Classes**: AppError for operational errors
4. **Logging**: Winston for structured logging
5. **Monitoring**: Health check endpoints
