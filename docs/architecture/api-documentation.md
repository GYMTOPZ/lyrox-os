# LYROX OS - API Documentation

**Version:** 0.1.0 (Design Phase)
**Last Updated:** 2025-10-31
**Base URL:** `http://localhost:3000` (dev) | `https://api.lyrox.com` (prod)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Response Format](#response-format)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [Endpoints](#endpoints)
   - [Auth](#auth-endpoints)
   - [Companies](#company-endpoints)
   - [Products](#product-endpoints)
   - [Customers](#customer-endpoints)
   - [Conversations](#conversation-endpoints)
   - [Sales](#sales-endpoints)
   - [WhatsApp](#whatsapp-endpoints)
   - [Metrics](#metrics-endpoints)

---

## Authentication

### JWT Bearer Token

All authenticated endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Getting a Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "pedro@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": "user-id",
    "email": "pedro@example.com",
    "name": "Pedro Meza"
  },
  "company": {
    "id": "company-id",
    "name": "Emilio Born Coaching"
  }
}
```

---

## Response Format

### Success Response

```json
{
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2025-10-31T12:00:00Z",
    "version": "0.1.0"
  }
}
```

### Paginated Response

```json
{
  "data": [/* items */],
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-10-31T12:00:00Z"
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---

## Rate Limiting

**Phase 0 Limits:**
- Authentication endpoints: 5 requests / minute
- API endpoints: 100 requests / minute
- WhatsApp webhook: 1000 requests / minute

**Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698765432
```

---

## Endpoints

## Auth Endpoints

### Login

```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "pedro@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": "user-uuid",
    "email": "pedro@example.com",
    "name": "Pedro Meza"
  },
  "company": {
    "id": "company-uuid",
    "name": "Emilio Born Coaching"
  }
}
```

---

### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "user-uuid",
    "email": "pedro@example.com",
    "name": "Pedro Meza",
    "company": {
      "id": "company-uuid",
      "name": "Emilio Born Coaching"
    }
  }
}
```

---

## Company Endpoints

### Get Company Details

```http
GET /api/companies/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "company-uuid",
    "name": "Emilio Born Coaching",
    "industry": "Fitness & Wellness",
    "brandPersonality": "Eres Emilio Born...",
    "whatsappPhone": "+1305555XXXX",
    "whatsappConnected": true,
    "active": true,
    "subscriptionPlan": "free",
    "createdAt": "2025-10-31T10:00:00Z"
  }
}
```

---

### Update Company

```http
PATCH /api/companies/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Updated Name",
  "brandPersonality": "Updated prompt..."
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "company-uuid",
    "name": "Updated Name",
    /* ... rest of company data */
  }
}
```

---

## Product Endpoints

### List Products

```http
GET /api/products
Authorization: Bearer <token>
```

**Query Parameters:**
- `active` (boolean): Filter by active status

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "product-uuid-1",
      "name": "Plan Personalizado",
      "description": "Plan de entrenamiento...",
      "price": 98.00,
      "currency": "USD",
      "paymentLink": "https://buy.stripe.com/...",
      "active": true,
      "createdAt": "2025-10-31T10:00:00Z"
    }
  ]
}
```

---

### Create Product

```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "New Product",
  "description": "Description here",
  "price": 49.99,
  "paymentLink": "https://buy.stripe.com/..."
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "new-product-uuid",
    "name": "New Product",
    /* ... rest of product data */
  }
}
```

---

### Update Product

```http
PATCH /api/products/:id
Authorization: Bearer <token>
```

**Body:** (any fields to update)
```json
{
  "price": 59.99,
  "active": false
}
```

---

### Delete Product

```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

## Customer Endpoints

### List Customers

```http
GET /api/customers
Authorization: Bearer <token>
```

**Query Parameters:**
- `stage` (string): Filter by stage (lead, qualified, customer, churned)
- `search` (string): Search by name or phone
- `page` (number): Page number (default: 1)
- `perPage` (number): Items per page (default: 20)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "customer-uuid",
      "phone": "+1786555XXXX",
      "name": "Pedro García",
      "stage": "customer",
      "firstContact": "2025-11-01T10:00:00Z",
      "lastInteraction": "2025-11-03T15:30:00Z",
      "totalInteractions": 25,
      "lifetimeValue": 98.00,
      "tags": ["hot-lead", "fitness-goal"]
    }
  ],
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### Get Customer Details

```http
GET /api/customers/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "customer-uuid",
    "phone": "+1786555XXXX",
    "name": "Pedro García",
    "email": "pedro@example.com",
    "stage": "customer",
    /* ... customer details */
    "purchases": [
      {
        "id": "sale-uuid",
        "productName": "Plan Personalizado",
        "amount": 98.00,
        "date": "2025-11-02T14:00:00Z"
      }
    ]
  }
}
```

---

## Conversation Endpoints

### List Conversations

```http
GET /api/conversations
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Page number
- `perPage` (number): Items per page
- `stage` (string): Filter by customer stage

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "conversation-id",
      "customerId": "customer-uuid",
      "customerName": "Pedro García",
      "customerPhone": "+1786555XXXX",
      "lastMessage": "Gracias por la info!",
      "lastInteraction": "2025-11-03T15:30:00Z",
      "messageCount": 12,
      "stage": "qualified"
    }
  ],
  "meta": { /* pagination */ }
}
```

---

### Get Conversation Details

```http
GET /api/conversations/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "conversation-id",
    "customer": {
      "id": "customer-uuid",
      "name": "Pedro García",
      "phone": "+1786555XXXX"
    },
    "messages": [
      {
        "id": "msg-1",
        "timestamp": "2025-11-01T10:30:00Z",
        "direction": "incoming",
        "sender": "customer",
        "content": "Hola, me interesa el coaching"
      },
      {
        "id": "msg-2",
        "timestamp": "2025-11-01T10:30:15Z",
        "direction": "outgoing",
        "sender": "agent",
        "content": "¡Hola Pedro! 💪 Cuéntame..."
      }
    ],
    "summary": {
      "keyPoints": ["Objetivo: perder 10kg", "Presupuesto: $100"],
      "recommendedAction": "Ofrecer Plan Personalizado"
    }
  }
}
```

---

## Sales Endpoints

### List Sales

```http
GET /api/sales
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (ISO date): Filter from date
- `endDate` (ISO date): Filter to date
- `customerId` (UUID): Filter by customer
- `page`, `perPage`: Pagination

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "sale-uuid",
      "customer": {
        "id": "customer-uuid",
        "name": "Pedro García"
      },
      "product": {
        "id": "product-uuid",
        "name": "Plan Personalizado"
      },
      "amount": 98.00,
      "currency": "USD",
      "paymentMethod": "stripe",
      "paymentStatus": "completed",
      "saleDate": "2025-11-02T14:00:00Z"
    }
  ],
  "meta": { /* pagination */ }
}
```

---

## WhatsApp Endpoints

### Get Connection Status

```http
GET /api/whatsapp/status
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "data": {
    "connected": true,
    "phone": "+1305555XXXX",
    "lastConnected": "2025-11-01T09:00:00Z",
    "qrCode": null
  }
}
```

---

### Generate QR Code

```http
POST /api/whatsapp/qr
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KG...",
    "expiresIn": 60
  }
}
```

---

### Disconnect WhatsApp

```http
POST /api/whatsapp/disconnect
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "data": {
    "connected": false,
    "message": "WhatsApp disconnected successfully"
  }
}
```

---

### Send Test Message (Dev Only)

```http
POST /api/whatsapp/test
Authorization: Bearer <token>
```

**Body:**
```json
{
  "phone": "+1786555XXXX",
  "message": "Test message"
}
```

**Response:** `200 OK`

---

## Metrics Endpoints

### Get Dashboard Metrics

```http
GET /api/metrics/dashboard
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (string): today, week, month, year

**Response:** `200 OK`
```json
{
  "data": {
    "period": "today",
    "metrics": {
      "totalMessages": 45,
      "totalConversations": 12,
      "newCustomers": 3,
      "totalSales": 2,
      "revenue": 176.00,
      "conversionRate": 0.167,
      "avgResponseTime": 3.2
    },
    "trend": {
      "messages": "+15%",
      "sales": "+25%",
      "revenue": "+30%"
    }
  }
}
```

---

### Get Revenue Analytics

```http
GET /api/metrics/revenue
Authorization: Bearer <token>
```

**Query Parameters:**
- `groupBy` (string): day, week, month
- `startDate`, `endDate` (ISO dates)

**Response:** `200 OK`
```json
{
  "data": {
    "totalRevenue": 5420.00,
    "breakdown": [
      {
        "date": "2025-11-01",
        "revenue": 294.00,
        "salesCount": 3
      },
      {
        "date": "2025-11-02",
        "revenue": 392.00,
        "salesCount": 4
      }
    ]
  }
}
```

---

## WebSocket Events

### Connect to Real-Time Updates

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Listen for new messages
socket.on('message:received', (data) => {
  console.log('New message:', data);
});

// Listen for new sales
socket.on('sale:completed', (data) => {
  console.log('New sale:', data);
});

// Listen for connection status
socket.on('whatsapp:status', (data) => {
  console.log('WhatsApp status:', data);
});
```

### Events Emitted by Server

| Event | Description | Payload |
|-------|-------------|---------|
| `message:received` | New customer message | `{ customerId, message, timestamp }` |
| `message:sent` | Agent sent response | `{ customerId, message, timestamp }` |
| `sale:completed` | New sale recorded | `{ saleId, amount, customerId }` |
| `whatsapp:connected` | WhatsApp connected | `{ phone, timestamp }` |
| `whatsapp:disconnected` | WhatsApp disconnected | `{ reason, timestamp }` |
| `customer:created` | New customer | `{ customerId, name, phone }` |

---

## Webhooks (Future)

### Stripe Webhook

```http
POST /api/webhooks/stripe
```

Handles Stripe payment events.

---

## Appendix

### Common Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
X-Request-ID: unique-request-id (optional)
```

### Pagination

All list endpoints support pagination:
- `page`: Page number (default: 1)
- `perPage`: Items per page (default: 20, max: 100)

---

## OpenAPI / Swagger

Interactive API documentation available at:
- **Dev:** http://localhost:3000/api/docs
- **Prod:** https://api.lyrox.com/docs

---

**Document Version:** 0.1.0
**Last Updated:** 2025-10-31
**Next Update:** After implementation starts
