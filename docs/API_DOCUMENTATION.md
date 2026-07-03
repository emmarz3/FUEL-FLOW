# FuelFlow Africa - API Documentation

## Overview

FuelFlow Africa API provides endpoints for managing fuel subscriptions, payments, deliveries, and user accounts. All endpoints return JSON responses.

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Base URL

```
http://localhost:5000/api/v1
```

## API Endpoints

### Auth

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+2348000000000",
  "role": "customer"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Forgot Password
```
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}

Response: 200 OK
{
  "success": true,
  "message": "Reset token sent to email"
}
```

### Subscriptions

#### Create Subscription
```
POST /subscriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "fuelType": "petrol",
  "planType": "monthly",
  "quantity": 1000,
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "zipCode": "100001"
  },
  "cardId": "64a7b1c2d3e4f5a6b7c8d9e0"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "subscription": { ... },
    "paymentLink": "https://nomba.dev/payment/..."
  }
}
```

#### Pause Subscription
```
PATCH /subscriptions/:id/pause
Authorization: Bearer <token>

{
  "reason": "Scheduled maintenance"
}

Response: 200 OK
{
  "success": true,
  "message": "Subscription paused successfully",
  "data": { ... }
}
```

#### Resume Subscription
```
PATCH /subscriptions/:id/resume
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Subscription resumed successfully",
  "data": { ... }
}
```

#### Cancel Subscription
```
PATCH /subscriptions/:id/cancel
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": { ... }
}
```

### Payments

#### Create Payment
```
POST /payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "currency": "NGN",
  "cardId": "64a7b1c2d3e4f5a6b7c8d9e0",
  "subscriptionId": "64a7b1c2d3e4f5a6b7c8d9e0",
  "description": "Monthly subscription payment"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "payment": { ... },
    "charge": { ... }
  }
}
```

#### Refund Payment
```
POST /payments/:id/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "reason": "Customer request"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "payment": { ... },
    "refund": { ... }
  }
}
```

### Cards

#### Save Card
```
POST /cards
Authorization: Bearer <token>
Content-Type: application/json

{
  "number": "4242424242424242",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "cvv": "123",
  "name": "John Doe",
  "billingAddress": {
    "addressLine1": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "zipCode": "100001"
  }
}

Response: 201 Created
{
  "success": true,
  "data": {
    "card": {
      "id": "...",
      "brand": "visa",
      "last4": "4242",
      "expiryMonth": 12,
      "expiryYear": 2025,
      "isDefault": true,
      "displayName": "Visa •••• 4242"
    }
  }
}
```

### Webhooks

#### Nomba Webhook Handler
```
POST /webhooks/nomba
Content-Type: application/json
x-nomba-signature: sha256=...

{
  "event": "payment.success",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00Z"
}

Response: 200 OK
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### Common HTTP Status Codes

- 200 OK - Request successful
- 201 Created - Resource created successfully
- 400 Bad Request - Invalid request data
- 401 Unauthorized - Authentication required
- 403 Forbidden - Access denied
- 404 Not Found - Resource not found
- 422 Unprocessable Entity - Validation error
- 429 Too Many Requests - Rate limit exceeded
- 500 Internal Server Error - Server error
