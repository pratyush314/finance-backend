# Finance Dashboard Backend

A production-style finance dashboard API built with Express.js, Mongoose ODM, and MongoDB. Features role-based access control, JWT authentication, financial record management, and comprehensive dashboard analytics endpoints.

**Live API:** `https://finance-backend-gtv7.onrender.com`  
**Health Check:** `https://finance-backend-gtv7.onrender.com/health`  
**Postman Files:** `postman/finance-backend-collection.json` & `postman/finance-backend-environment.json`

## 🎯 Quick Test (30 seconds)

### 1. Health Check

```bash
curl https://finance-backend-gtv7.onrender.com/health
```

### 2. Postman (Recommended)

## 🎯 Purpose

This is a backend internship assignment project that demonstrates core backend engineering concepts:

- RESTful API design
- Authentication & Authorization (JWT + RBAC)
- Modular architecture (controllers, services, middleware)
- Database modeling and migrations
- Input validation and error handling
- Dashboard analytics
- Clean code practices

## 🛠️ Tech Stack

- **Framework:** Express.js (Node.js)
- **Language:** TypeScript
- **ODM:** Mongoose
- **Databases:** MongoDB, Redis
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Validation:** Zod
- **Runtime:** Node.js 18+
- **Package Manager:** npm

## 📋 Why These Technologies?

| Technology             | Why                                                                    |
| ---------------------- | ---------------------------------------------------------------------- |
| **Express.js**         | Lightweight, widely-used, great for learning REST API fundamentals     |
| **Mongoose + MongoDB** | Flexible schema, excellent Node.js integration, document-oriented data |
| **Redis**              | High availability, in-memory key-value store, good for rate limiting   |
| **TypeScript**         | Catches errors at compile-time, makes code self-documenting            |
| **JWT**                | Stateless auth, industry-standard, suitable for dashboards             |
| **bcrypt**             | Secure password hashing with salt, industry-standard                   |
| **Zod**                | Runtime validation with excellent TypeScript support                   |

## 📁 Architecture

```
src/
├── app.ts                    # Express app setup
├── server.ts                 # Server entry point
├── config/
│   └── env.ts                # Environment variables
├── routes/                   # API route handlers
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── record.routes.ts
│   └── dashboard.routes.ts
├── controllers/              # Request/response handling
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── record.controller.ts
│   └── dashboard.controller.ts
├── services/                 # Business logic
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── record.service.ts
│   └── dashboard.service.ts
├── middlewares/              # Express middleware
│   ├── auth.middleware.ts               # JWT verification
│   ├── requireActiveUser.middleware.ts  # User status check
│   ├── authorize.middleware.ts          # Role-based access
│   ├── validate.middleware.ts           # Input validation
│   ├── notFound.middleware.ts           # 404 handler
│   └── errorHandler.middleware.ts       # Global error handler
├── models/                   # Mongoose schemas
│   ├── User.ts
│   └── FinancialRecord.ts
├── validators/               # Zod schemas
│   ├── auth.validator.ts
│   ├── user.validator.ts
│   ├── record.validator.ts
│   └── dashboard.validator.ts
├── utils/                    # Shared utilities
│   ├── apiResponse.ts        # JSON response wrapper
│   ├── apiError.ts           # Custom error class
│   ├── pagination.ts         # Pagination utilities
│   └── dateHelpers.ts        # Date utilities
├── lib/
│   └── mongodb.ts            # MongoDB connection
└── scripts/
    └── seed.ts               # Seed script

```

## 🔐 Role-Based Access Control (RBAC)

### Permission Matrix

| Action                       | Viewer | Analyst | Admin |
| ---------------------------- | ------ | ------- | ----- |
| **User Management**          | ❌     | ❌      | ✅    |
| Create/Update/Delete Records | ❌     | ✅      | ✅    |
| Read Records                 | ❌     | ✅      | ✅    |
| View Dashboard/Insights      | ✅     | ✅      | ✅    |
| Manage Roles/Status          | ❌     | ❌      | ✅    |

### Middleware Chain

Each protected route follows this flow:

```
Request
  ↓
authMiddleware (verify JWT, attach user)
  ↓
requireActiveUserMiddleware (check user.status === ACTIVE)
  ↓
validateMiddleware (validate input)
  ↓
authorize(...allowedRoles) (check user.role is allowed)
  ↓
Controller → Service → Database
  ↓
Response
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (download from [nodejs.org](https://nodejs.org))
- npm (comes with Node.js)
- Git (optional, for cloning)

### Installation

1. **Navigate to project directory:**

   ```bash
   cd finance-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your MongoDB connection details:

   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/finance-db
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRY=7d
   ```

4. **Seed the database with test data:**

   ```bash
   npm run seed
   ```

5. **Start the server:**

   ```bash
   npm run dev
   ```

   Expected output:

   ```
   ✅ Server running on http://localhost:5000 (development mode)
   ```

## 🧪 Test Credentials

After seeding, use these credentials to login:

| Role       | Email                  | Password      | Notes             |
| ---------- | ---------------------- | ------------- | ----------------- |
| Admin      | `admin@finance.com`    | `admin123`    | Full access       |
| Analyst    | `analyst@finance.com`  | `analyst123`  | Read + dashboard  |
| Viewer     | `viewer@finance.com`   | `viewer123`   | Read-only         |
| (Inactive) | `inactive@finance.com` | `inactive123` | Can't access APIs |

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/login           Login and get JWT token
GET    /api/auth/me              Get current user info (requires token)
```

**Example: Login**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finance.com","password":"admin123"}'
```

Response:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "cuid123...",
      "email": "admin@finance.com",
      "name": "Admin User",
      "role": "ADMIN",
      "status": "ACTIVE"
    }
  }
}
```

### User Management (Admin only)

```
POST   /api/users                Create new user
GET    /api/users                List all users (with filters)
GET    /api/users/:id            Get user by ID
PATCH  /api/users/:id            Update user profile
PATCH  /api/users/:id/role       Change user role
PATCH  /api/users/:id/status     Change user status (ACTIVE/INACTIVE)
DELETE /api/users/:id            Delete user
```

**Example: Create User**

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "secure123",
    "role": "ANALYST"
  }'
```

### Financial Records

```
POST   /api/records               Create record (Analyst, Admin)
GET    /api/records               List records with filtering (all users)
GET    /api/records/:id           Get record by ID (all users)
PATCH  /api/records/:id           Update record (Admin only)
DELETE /api/records/:id           Delete record (Admin only)
```

**Filtering & Pagination:**

```bash
# Filter by type and category
GET /api/records?type=INCOME&category=Salary&page=1&limit=10

# Filter by date range
GET /api/records?from=2024-01-01&to=2024-01-31

# Custom sort
GET /api/records?sortBy=amount&sortOrder=desc&limit=5
```

**Query Parameters:**

- `type`: `INCOME` or `EXPENSE`
- `category`: Filter by category (partial match)
- `from`: Start date (ISO 8601)
- `to`: End date (ISO 8601)
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 10, max: 100)
- `sortBy`: `date`, `amount`, `createdAt` (default: `createdAt`)
- `sortOrder`: `asc` or `desc` (default: `desc`)

**Example: Create Record**

```bash
curl -X POST http://localhost:5000/api/records \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500.50,
    "type": "INCOME",
    "category": "Freelance",
    "date": "2024-03-15",
    "notes": "Contract project payment"
  }'
```

### Dashboard Analytics

```
GET    /api/dashboard/overview              Total income/expense/balance
GET    /api/dashboard/category-breakdown    Breakdown by category
GET    /api/dashboard/recent-activity       Recent transactions (limit: 10)
GET    /api/dashboard/monthly-trends        Monthly income/expense trends
```

**Example: Get Overview**

```bash
curl -X GET 'http://localhost:5000/api/dashboard/overview?from=2024-01-01&to=2024-03-31' \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "totalIncome": 19000,
    "totalExpense": 4630,
    "netBalance": 14370,
    "recordCount": 19
  }
}
```

**Example: Category Breakdown**

```bash
curl -X GET 'http://localhost:5000/api/dashboard/category-breakdown?type=INCOME' \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📝 Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  passwordHash: String,
  role: String (VIEWER | ANALYST | ADMIN),
  status: String (ACTIVE | INACTIVE),
  createdAt: Date,
  updatedAt: Date
}
```

### FinancialRecord Collection

```javascript
{
  _id: ObjectId,
  amount: Number,
  type: String (INCOME | EXPENSE),
  category: String,
  date: Date,
  notes: String (optional),
  createdBy: ObjectId (reference to User),
  createdAt: Date,
  updatedAt: Date
}
```

## ✅ Error Handling

All errors return JSON with consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### Common Status Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | OK                                   |
| 201  | Created                              |
| 400  | Bad Request (validation error)       |
| 401  | Unauthorized (missing/invalid token) |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found                            |
| 409  | Conflict (email already exists)      |
| 500  | Internal Server Error                |

## 🔄 Data Flow Example

Creating a financial record:

```
1. Client sends POST /api/records with data
   ↓
2. authMiddleware verifies JWT token
   ↓
3. requireActiveUserMiddleware checks user status
   ↓
4. validate(createRecordSchema) validates input
   ↓
5. authorize('ADMIN', 'ANALYST') checks role
   ↓
6. recordController.createRecord() receives request
   ↓
7. recordService.createRecord() executes business logic
   ↓
8. FinancialRecord.create() inserts document into MongoDB
   ↓
9. Response with created record returned to client
```

## 🛠️ Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production build
npm start

# Seed database with test data
npm run seed

# Format code with Prettier
npm run format

# Lint with ESLint
npm run lint

# Run tests
npm run test
```

## 📚 Assumptions & Design Decisions

1. **Password Security:** Passwords are securely hashed using bcrypt with salt before storing. Never stored in plain text.

2. **Token Expiry:** JWT tokens expire after 7 days. Implement refresh tokens in production.

3. **Pagination:** Results default to page 1, limit 10 records. Maximum limit is 100.

4. **Soft Deletes:** Currently uses hard deletes. Consider implementing soft deletes for audit trails in production.

5. **Datetime Format:** Records store dates in ISO 8601 format. Dashboard calculations use local timezone.

6. **No Audit Log:** The system doesn't track who modified records. Consider adding audit logging for compliance.

7. **Category as String:** Categories are freeform strings, not enums. Implement predefined categories in production.

8. **MongoDB:** Uses MongoDB for flexible document storage. Ensure proper indexing and connection pooling in production.

## 🚀 Deployment Considerations

For production deployment:

1. **Database:**
   - Use MongoDB Atlas or self-hosted MongoDB with replica sets
   - Enable connection pooling
   - Create appropriate indexes for queries
   - Set up backups and monitoring
2. **Authentication:**
   - Ensure JWT_SECRET is strong and unique per environment
   - Implement refresh tokens for better security
   - Add rate limiting on login endpoints
3. **Security:**
   - Use HTTPS only
   - Implement CORS properly
   - Add request rate limiting
   - Validate all inputs server-side
   - Use environment variables for secrets
   - Enable MongoDB authentication and encryption
4. **Monitoring:**
   - Add structured logging
   - Implement error tracking (Sentry, etc.)
   - Monitor database performance and connection usage
   - Set up alerts for critical errors
5. **Testing:**
   - Add unit tests for services
   - Add integration tests for APIs
   - Add E2E tests

## 📈 Future Enhancements

- [ ] Unit and integration tests
- [ ] Swagger/OpenAPI documentation
- [ ] Postman collection
- [ ] Password reset flow
- [ ] Search functionality
- [ ] Export to CSV/PDF
- [ ] Recurring transactions
- [ ] Budget setting & alerts
- [ ] Multi-user collaboration
- [ ] File upload for receipts
- [ ] Mobile app (React Native)

## 🐛 Troubleshooting

**Error: "Cannot find module 'mongoose'"**

```bash
npm install
```

**Error: "EADDRINUSE: address already in use :::5000"**
The port is already in use. Either:

- Kill the process using port 5000
- Change PORT in .env

**Error: "Invalid token" on login**

- Ensure JWT_SECRET in .env matches compile time
- Token might have expired (see JWT_EXPIRY)

**Error: "MongoDB connection failed"**

- Ensure MongoDB is running (or check MONGODB_URI in .env)
- For local MongoDB: `mongod` should be running
- For MongoDB Atlas: Check connection string and IP whitelist

```bash
# Verify MongoDB connection
mongosh "your-connection-string"
```

## 📖 Learning Resources

- [Express.js docs](https://expressjs.com)
- [Mongoose docs](https://mongoosejs.com/docs)
- [MongoDB University](https://university.mongodb.com)
- [JWT explanation](https://jwt.io/introduction)
- [REST API best practices](https://restfulapi.net)

## 📄 License

MIT

---

**Built for internship assignment.** Last updated: March 2024
