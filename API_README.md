# TheMarket4All API Documentation

## Overview

The TheMarket4All API provides a complete backend solution for the digital supermarket platform, including product management, order processing, and payment handling.

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Development Mode**
   ```bash
   npm run dev
   ```

The API server will start on `http://localhost:3000`

## 📋 API Endpoints

### Products

#### Get All Products
```
GET /api/products
```
Returns all available products.

**Response:**
```json
[
  {
    "id": "apple-organic",
    "name": "Fresh Organic Apples",
    "category": "fruits-vegetables",
    "price": 2.99,
    "unit": "lb",
    "image": "fas fa-apple-alt",
    "description": "Sweet and crisp organic apples...",
    "details": {
      "nutrition": { ... },
      "ingredients": ["Organic Apples"],
      "allergens": ["None"],
      "storage": "Refrigerate for up to 2 weeks",
      "origin": "Local Organic Farms",
      "certifications": ["USDA Organic", "Non-GMO"]
    },
    "stock": 150,
    "rating": 4.8,
    "reviews": 124,
    "tags": ["organic", "fresh", "local", "healthy"]
  }
]
```

#### Get Products by Category
```
GET /api/products/category/:categoryId
```
Returns products filtered by category.

#### Get Single Product
```
GET /api/products/:productId
```
Returns detailed information for a specific product.

#### Search Products
```
GET /api/products/search/:query
```
Searches products by name, description, or tags.

### Categories

#### Get All Categories
```
GET /api/categories
```
Returns all product categories.

**Response:**
```json
[
  {
    "id": "fruits-vegetables",
    "name": "Fresh Fruits & Vegetables",
    "icon": "fas fa-apple-alt",
    "description": "Organic and fresh produce delivered daily"
  }
]
```

### Orders

#### Create Order
```
POST /api/orders
```

**Request Body:**
```json
{
  "items": [
    {
      "id": "apple-organic",
      "name": "Fresh Organic Apples",
      "price": "$2.99/lb",
      "quantity": 2
    }
  ],
  "customerInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, State"
  },
  "totalAmount": 5.98
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "uuid-string",
  "message": "Order created successfully"
}
```

#### Get Order
```
GET /api/orders/:orderId
```

#### Update Order Status
```
PATCH /api/orders/:orderId
```

**Request Body:**
```json
{
  "status": "paid"
}
```

### Payments

#### Process Payment
```
POST /api/payments
```

**Request Body:**
```json
{
  "orderId": "uuid-string",
  "paymentMethod": "credit_card",
  "cardInfo": {
    "cardNumber": "1234567890123456",
    "expiry": "12/25",
    "cvv": "123",
    "cardName": "John Doe"
  },
  "amount": 25.99
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": "uuid-string",
  "message": "Payment processing started"
}
```

#### Get Payment Status
```
GET /api/payments/:paymentId
```

**Response:**
```json
{
  "id": "uuid-string",
  "orderId": "uuid-string",
  "paymentMethod": "credit_card",
  "amount": 25.99,
  "status": "completed",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:02.000Z"
}
```

### Health Check

#### API Health Status
```
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

## 🛠️ Features

### Product Management
- ✅ Complete product catalog with detailed information
- ✅ Category-based filtering
- ✅ Search functionality
- ✅ Nutritional information and product details
- ✅ Stock management
- ✅ Rating and review system

### Order Processing
- ✅ Order creation and management
- ✅ Customer information handling
- ✅ Order status tracking
- ✅ Cart management

### Payment Processing
- ✅ Credit card payment simulation
- ✅ Payment status tracking
- ✅ Order-payment integration
- ✅ Secure payment handling

### Data Management
- ✅ JSON-based product database
- ✅ In-memory order and payment storage
- ✅ RESTful API design
- ✅ Error handling and validation

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

### Database

Currently using in-memory storage for development. For production, consider:

- **MongoDB**: For flexible document storage
- **PostgreSQL**: For relational data
- **Redis**: For caching and session management

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 API Testing

### Using curl

```bash
# Get all products
curl http://localhost:3000/api/products

# Create an order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id": "apple-organic", "name": "Apples", "price": "$2.99/lb", "quantity": 1}],
    "customerInfo": {"firstName": "John", "lastName": "Doe", "email": "john@example.com"},
    "totalAmount": 2.99
  }'

# Process payment
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-uuid",
    "paymentMethod": "credit_card",
    "amount": 2.99
  }'
```

### Using Postman

Import the following collection:

```json
{
  "info": {
    "name": "TheMarket4All API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Products",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/products"
      }
    },
    {
      "name": "Create Order",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/orders",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"items\": [{\n    \"id\": \"apple-organic\",\n    \"name\": \"Fresh Organic Apples\",\n    \"price\": \"$2.99/lb\",\n    \"quantity\": 1\n  }],\n  \"customerInfo\": {\n    \"firstName\": \"John\",\n    \"lastName\": \"Doe\",\n    \"email\": \"john@example.com\",\n    \"phone\": \"+1234567890\",\n    \"address\": \"123 Main St, City, State\"\n  },\n  \"totalAmount\": 2.99\n}"
        }
      }
    }
  ]
}
```

## 🔒 Security Considerations

### Production Deployment

1. **HTTPS**: Always use HTTPS in production
2. **Environment Variables**: Store sensitive data in environment variables
3. **Input Validation**: Implement proper input validation
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Authentication**: Implement user authentication and authorization
6. **CORS**: Configure CORS properly for your domain

### Payment Security

- Use a real payment processor (Stripe, PayPal, etc.)
- Never store credit card information
- Implement PCI DSS compliance
- Use secure payment gateways

## 🐛 Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

Error responses include a message:

```json
{
  "error": "Product not found"
}
```

## 📈 Monitoring

### Health Check
Monitor API health with the `/api/health` endpoint.

### Logging
Add logging middleware for production:

```javascript
const morgan = require('morgan');
app.use(morgan('combined'));
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For API support and questions:

- **Email**: api-support@themarket4all.com
- **Documentation**: [API Docs](https://docs.themarket4all.com)
- **Issues**: [GitHub Issues](https://github.com/themarket4all/api/issues)

---

**TheMarket4All API** - Powering the future of digital grocery shopping! 🛒✨ 