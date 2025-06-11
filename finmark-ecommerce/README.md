# Finmark E-commerce Platform Prototype

A comprehensive full-stack e-commerce platform built for **Finmark Corporation**, featuring business intelligence, marketing analytics, and multi-tenant architecture designed to serve SMEs in the Philippines.

![Finmark E-commerce Platform](https://img.shields.io/badge/Finmark-E--commerce-blue) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)

## 🌟 Overview

Finmark Corporation's e-commerce platform prototype demonstrates a scalable, secure, and feature-rich solution that combines e-commerce functionality with advanced business intelligence. Built with modern technologies and designed for the Philippine market, this platform serves as a foundation for helping SMEs leverage data-driven insights for growth and optimization.

### 🏢 About Finmark Corporation
- **Location**: Makati City, Manila, Philippines
- **Services**: Business Intelligence, Marketing Analytics, Financial Analysis, E-commerce Solutions
- **Mission**: Empowering SMEs with data-driven insights and digital transformation
- **Target Market**: Retail, E-commerce, Healthcare, and Manufacturing sectors

## ✨ Key Features

### 🔐 Authentication & Security
- **JWT-based Authentication** with 15-minute access tokens and 24-hour refresh tokens
- **Role-based Access Control** (Customer, Admin)
- **Password Security** with bcrypt hashing and strength validation
- **Multi-tenant Architecture** with client isolation
- **Input Validation** and SQL injection prevention

### 🛍️ E-commerce Core
- **Product Catalog** with categories, search, and filtering
- **Shopping Cart** with localStorage persistence
- **Inventory Management** with stock tracking
- **Order Processing** simulation
- **Responsive Design** for mobile and desktop

### 📊 Business Intelligence
- **Real-time Analytics Dashboard** (Admin)
- **User Activity Tracking**
- **Product Performance Metrics**
- **Sales Analytics** and reporting
- **Event-based Analytics** system

### 🏗️ Architecture
- **Microservices-Ready** design with service separation
- **API-First** approach with RESTful endpoints
- **Database-Driven** with PostgreSQL
- **Scalable** and maintainable codebase

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS V4** - Modern styling
- **ShadCN UI** - Component library
- **React Context** - State management
- **Responsive Design** - Mobile-first approach

### Backend
- **Next.js API Routes** - Serverless functions
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Node.js** - Runtime environment

### Development Tools
- **bun** - Package manager and runtime
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Git** - Version control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or bun
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finmark-ecommerce
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=finmark_ecommerce
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb finmark_ecommerce
   
   # Start the development server
   bun dev
   ```

5. **Initialize Database**
   
   Visit `http://localhost:3000` and the database will be automatically initialized with sample data.

6. **Access the Application**
   ```
   http://localhost:3000
   ```

### Demo Credentials

#### Admin Account
- **Email**: admin@finmarksolutions.ph
- **Password**: Admin123!

#### Customer Account
- **Email**: demo@customer.com
- **Password**: Customer123!

## 📁 Project Structure

```
finmark-ecommerce/
├── app/                          # Next.js App Router
│   ├── api/                      # API endpoints
│   │   ├── auth/                 # Authentication routes
│   │   ├── products/             # Product management
│   │   ├── analytics/            # Analytics endpoints
│   │   └── init-db/              # Database initialization
│   ├── auth/                     # Authentication pages
│   ├── products/                 # Product catalog
│   ├── cart/                     # Shopping cart
│   ├── dashboard/                # User dashboard
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/                   # Reusable components
│   └── ui/                       # ShadCN UI components
├── contexts/                     # React contexts
│   ├── AuthContext.tsx          # Authentication state
│   └── CartContext.tsx          # Shopping cart state
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Auth utilities
│   ├── database.ts              # Database connection
│   └── utils.ts                  # General utilities
├── hooks/                        # Custom React hooks
├── .env.example                  # Environment template
├── .env.local                    # Local environment
├── package.json                  # Dependencies
└── README.md                     # Documentation
```

## 🔌 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer your-access-token
```

### Product Endpoints

#### Get Products
```http
GET /api/products?page=1&limit=12&category=Software&search=analytics
```

#### Get Product by ID
```http
GET /api/products/1
```

#### Create Product (Admin)
```http
POST /api/products
Authorization: Bearer admin-access-token
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "stockQuantity": 100,
  "category": "Software"
}
```

### Analytics Endpoints

#### Get Dashboard Data (Admin)
```http
GET /api/analytics/dashboard?days=30
Authorization: Bearer admin-access-token
```

#### Track Event
```http
POST /api/analytics/events
Authorization: Bearer access-token
Content-Type: application/json

{
  "eventType": "product_viewed",
  "eventData": {
    "productId": 1,
    "productName": "Analytics Dashboard"
  }
}
```

## 🗄️ Database Schema

### Tables

#### clients
```sql
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    domain VARCHAR(100) UNIQUE,
    contact_email VARCHAR(255),
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'customer',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, email)
);
```

#### products
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    category VARCHAR(100),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### analytics_events
```sql
CREATE TABLE analytics_events (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    user_id INTEGER REFERENCES users(id),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔒 Security Features

### Authentication Security
- **JWT Tokens** with short expiration times
- **Refresh Token** rotation for enhanced security
- **Password Hashing** using bcrypt with salt rounds
- **Password Policy** enforcement (complexity requirements)

### Data Protection
- **SQL Injection Prevention** through parameterized queries
- **Input Validation** on all endpoints
- **XSS Protection** through proper data sanitization
- **CORS Configuration** for API security
- **Environment Variables** for sensitive data

### Authorization
- **Role-Based Access Control** (RBAC)
- **Protected Routes** with middleware
- **Multi-Tenant Isolation** with client-specific data

## 📊 Analytics Features

### User Analytics
- User registration trends
- Login activity tracking
- Session management
- User behavior patterns

### Product Analytics
- Product view tracking
- Category performance
- Inventory monitoring
- Sales metrics

### Business Intelligence
- Real-time dashboards
- Custom event tracking
- Performance metrics
- Revenue analytics

## 🌐 Multi-Tenant Architecture

The platform supports multiple clients with:
- **Data Isolation** - Each client's data is completely separate
- **Customizable Features** - Per-client configuration options
- **Scalable Design** - Easy addition of new clients
- **Shared Infrastructure** - Efficient resource utilization

## 🚀 Deployment

### Development
```bash
bun dev
# Runs on http://localhost:3000
```

### Production Build
```bash
bun build
bun start
```

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PASSWORD=your-secure-password
JWT_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com
```

## 🧪 Testing

### Manual Testing
1. **User Registration** - Create new accounts
2. **Authentication Flow** - Login/logout functionality
3. **Product Browsing** - View and search products
4. **Shopping Cart** - Add/remove items
5. **Admin Dashboard** - View analytics (admin account)

### API Testing
Use the provided demo credentials to test all endpoints:
- Import the API collection into Postman
- Test authentication flows
- Verify CRUD operations
- Check analytics endpoints

## 🔧 Development

### Adding New Features
1. **API Endpoints** - Add to `app/api/`
2. **Frontend Pages** - Add to `app/`
3. **Components** - Add to `components/`
4. **Database Changes** - Update `lib/database.ts`

### Code Standards
- **TypeScript** for type safety
- **ESLint** for code quality
- **Consistent naming** conventions
- **Component modularity**

## 📈 Performance

### Optimizations
- **Database Query Optimization** with connection pooling
- **Client-Side Caching** with localStorage
- **Lazy Loading** for components
- **Image Optimization** through Next.js

### Monitoring
- **Error Tracking** through try-catch blocks
- **Performance Metrics** in analytics
- **User Activity Monitoring**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

### Finmark Corporation Contact
- **Address**: 123 Makati Avenue, Makati City, Manila, Philippines
- **Phone**: +63 2 1234 5678
- **Email**: info@finmarksolutions.ph
- **Website**: www.finmarksolutions.ph

### Technical Support
- Review the documentation
- Check the API endpoints
- Test with demo credentials
- Contact the development team

## 📄 License

This project is proprietary software of Finmark Corporation. All rights reserved.

---

**Built with ❤️ by Finmark Corporation**  
*Empowering SMEs with Data-Driven E-commerce Solutions*