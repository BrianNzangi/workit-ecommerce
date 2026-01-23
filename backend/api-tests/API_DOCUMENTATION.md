# Workit E-commerce API Documentation

## Base URL

- **Local**: `http://localhost:3001`
- **Production**: `https://api.workit.co.ke`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Get Access Token

**POST** `/auth/login`

```json
{
  "email": "admin@workit.co.ke",
  "password": "admin123456"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@workit.co.ke",
    "firstName": "Super",
    "lastName": "Admin",
    "role": "SUPER_ADMIN"
  }
}
```

---

## Endpoints

### Authentication

#### Register Customer
**POST** `/auth/register`

```json
{
  "email": "customer@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
**POST** `/auth/login`

```json
{
  "email": "admin@workit.co.ke",
  "password": "admin123456"
}
```

#### Get Profile
**GET** `/auth/me` 🔒

---

### Settings

#### Get All Settings (Admin)
**GET** `/settings`

Returns structured settings with all 6 sections.

#### Get Public Settings (Storefront)
**GET** `/settings/public`

Returns only safe settings (excludes secret keys).

#### Update Settings
**POST** `/settings` 🔒

```json
{
  "general": {
    "site_name": "Workit Store",
    "site_email": "store@workit.co.ke",
    "site_phone": "+254700000000",
    "timezone": "Africa/Nairobi"
  },
  "payments": {
    "default_currency": "KES",
    "paystack_public_key": "pk_test_xxxxx",
    "paystack_secret_key": "sk_test_xxxxx",
    "paystack_enabled": true
  }
}
```

---

### Products

#### Get All Products
**GET** `/products?limit=10&offset=0`

#### Search Products
**GET** `/products/search?q=laptop`

#### Get Single Product
**GET** `/products/:id`

#### Create Product
**POST** `/products` 🔒

```json
{
  "name": "Product Name",
  "slug": "product-slug",
  "description": "Product description",
  "enabled": true
}
```

#### Update Product
**PUT** `/products/:id` 🔒

---

### Collections

#### Get All Collections
**GET** `/collections`

#### Get Single Collection
**GET** `/collections/:id`

#### Create Collection
**POST** `/collections` 🔒

#### Update Collection
**PUT** `/collections/:id` 🔒

#### Delete Collection
**DELETE** `/collections/:id` 🔒

---

### Brands

#### Get All Brands
**GET** `/brands`

#### Get Single Brand
**GET** `/brands/:id`

#### Create Brand
**POST** `/brands` 🔒

#### Update Brand
**PUT** `/brands/:id` 🔒

#### Delete Brand
**DELETE** `/brands/:id` 🔒

---

### Orders

#### Checkout
**POST** `/orders/checkout` 🔒

```json
{
  "items": [
    {
      "variantId": "uuid",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "streetLine1": "123 Main St",
    "city": "Nairobi",
    "province": "Nairobi",
    "postalCode": "00100",
    "country": "KE",
    "phoneNumber": "+254700000000"
  }
}
```

#### Get My Orders
**GET** `/orders/me` 🔒

#### Get Single Order
**GET** `/orders/:id` 🔒

#### Update Order Status
**PUT** `/orders/:id/status` 🔒

```json
{
  "state": "SHIPPED"
}
```

---

### Analytics

#### Get Sales Stats
**GET** `/analytics/dashboard/sales?range=7d`

**Range options**: `24h`, `7d`, `1m`, `3m`, `6m`, `12m`

#### Get Order Stats
**GET** `/analytics/dashboard/orders?range=7d`

---

## Error Handling

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing with Hoppscotch

1. Import `hoppscotch-collection.json`
2. Select "Local Development" environment
3. Login to get access token
4. Copy token to `access_token` environment variable
5. Test protected endpoints

---

## Super Admin Credentials

- **Email**: `admin@workit.co.ke`
- **Password**: `admin123456`
- **Role**: `SUPER_ADMIN`

🔒 = Requires Authentication
