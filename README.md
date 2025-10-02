# Bot Content Manager Portal

A secure, user-friendly web application that allows non-technical users to manage chatbot response text through a Google Sheet interface. This application decouples bot copy from conversational logic, enabling dynamic updates and simplifying future migrations to other bot platforms.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication system for content managers
- **Content Dashboard**: Paginated table view with real-time search and filtering
- **CRUD Operations**: Create, read, update, and delete bot responses with inline editing
- **Google Sheets Integration**: Single source of truth using Google Sheets API
- **Dual API Architecture**: 
  - Management API for content managers (authenticated)
  - Delivery API for bot integration (API key based)
- **Change Auditing**: Automatic timestamp tracking for all modifications
- **Responsive Design**: Clean, intuitive interface that works on desktop screens
- **Docker Support**: Containerized deployment with docker-compose

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │  Google Sheets  │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Database)    │
│   Port: 5173    │    │   Port: 3001    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  Content        │    │  Bot            │
│  Managers       │    │  Integration    │
└─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

- Node.js 16+ and npm
- Docker and Docker Compose (for containerized deployment)
- Google Cloud Platform account
- Google Sheet with proper structure (see setup instructions)

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js framework
- **Google Sheets API** for data persistence
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-rate-limit** for API protection

### Frontend
- **React 18** with Vite
- **React Query** for data fetching and caching
- **React Router** for navigation
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Infrastructure
- **Docker** for containerization
- **Nginx** for frontend serving
- **Google Cloud Service Account** for API authentication

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bot-content-manager
```

### 2. Set Up Google Cloud Service Account

#### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API

#### Step 2: Create a Service Account
1. Navigate to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Fill in the details:
   - **Name**: `bot-content-manager`
   - **Description**: `Service account for Bot Content Manager`
4. Click **Create and Continue**
5. Skip role assignment for now
6. Click **Done**

#### Step 3: Generate and Download Key
1. Click on the created service account
2. Go to the **Keys** tab
3. Click **Add Key** > **Create New Key**
4. Choose **JSON** format
5. Download the key file

#### Step 4: Create and Configure Google Sheet
1. Create a new Google Sheet
2. Name it "Bot Content Manager"
3. Add the following headers in row 1:
   ```
   A1: key
   B1: response_text
   C1: notes
   D1: last_updated
   ```
4. Share the sheet with your service account email (found in the JSON key file)
5. Give it **Editor** permissions

### 3. Environment Configuration

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Google Sheets Configuration
GOOGLE_SHEET_ID=your-google-sheet-id-from-url
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# API Key for Delivery Endpoints
DELIVERY_API_KEY=your-delivery-api-key-for-bot-integration

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

**Important Notes:**
- Extract `GOOGLE_SHEET_ID` from your Google Sheet URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
- Copy the `client_email` from your JSON key file to `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- Copy the `private_key` from your JSON key file to `GOOGLE_PRIVATE_KEY` (keep the quotes and newlines)

### 🔐 Generating Secure Secrets

**CRITICAL**: Never use the default secrets in production! Generate strong, unique secrets for both `JWT_SECRET` and `DELIVERY_API_KEY`.

#### Method 1: Using OpenSSL (Recommended)
```bash
# Generate JWT_SECRET (64 character random string)
openssl rand -base64 64 | tr -d "=+/" | cut -c1-64

# Generate DELIVERY_API_KEY (128 character secure key)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Method 2: Using Node.js
```bash
# Generate both secrets at once
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(48).toString('base64')); console.log('DELIVERY_API_KEY=' + require('crypto').randomBytes(64).toString('hex'));"
```

#### Security Best Practices
- ✅ Store secrets securely (environment variables, secret managers)
- ✅ Never commit secrets to version control (.gitignore protection)
- ✅ Use different secrets for different environments (dev/staging/prod)
- ✅ Enable HTTPS in production
- ✅ Consider implementing secret rotation strategies
- ✅ Backup secrets securely in case of emergency

#### Example Production Secrets
```env
# Example of what generated secrets might look like (DO NOT USE THESE - GENERATE YOUR OWN!)
JWT_SECRET=X8rtdIhBhZQIZN2zZkuolKSC9uyj8MsdvNFO0D2Y22vRp10ZHCVJO2joKr9AIq3G8m8JJcveyB0oh4ueP0F5g
DELIVERY_API_KEY=77e3cb7f797bebd8262db062275245033b5692d1993491035c9c05c1cbf9a216dfeb25130e44b4c3ea32d0ffab5466b61f63591839c739babd34afa69e053af0
```

### 🤖 Bot Integration Usage

It's important to understand which token to use for different purposes:

#### For Content Managers (Web Dashboard)
- **Token Type**: JWT Token (Bearer authentication)
- **Generated From**: Login endpoint (`/api/auth/login`)
- **Usage**: Used in `Authorization: Bearer <jwt-token>` header
- **Access**: Management API endpoints (CRUD operations)

#### For Bot Applications (External Integration)
- **Token Type**: API Key (X-API-Key authentication)
- **Generated From**: Environment variable `DELIVERY_API_KEY`
- **Usage**: Used in `X-API-Key: <delivery-api-key>` header
- **Access**: Delivery API endpoints (read-only)

**Quick Reference:**
```http
# Content Manager API calls
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Bot Integration API calls
X-API-Key: 77e3cb7f797bebd8262db062275245033b5692d1993491035c9c05c1cbf9a216dfeb25130e44b4c3ea32d0ffab5466b61f63591839c739babd34afa69e053af0
```

### 4. Development Setup

#### Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### Start Development Servers

```bash
# From the root directory
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend development server on http://localhost:5173

#### Access the Application

1. Open http://localhost:5173 in your browser
2. Login with the default credentials:
   - **Username**: admin
   - **Password**: admin123

### 5. Production Deployment with Docker

#### Build and Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 📊 Google Sheet Schema

The application expects a Google Sheet with the following structure:

| Column | Name | Type | Description |
|--------|------|------|-------------|
| A | key | String | Unique identifier for the response (Primary Key) |
| B | response_text | String | The bot's response message |
| C | notes | String | Internal notes for context |
| D | last_updated | Timestamp | Automatically updated timestamp |

### Example Data

| key | response_text | notes | last_updated |
|-----|---------------|-------|--------------|
| greeting_welcome | Hello! How can I help you today? | Default welcome message | 2024-01-15 10:30:00 |
| order_confirmation | Thank you! Your order #{orderNumber} has been confirmed. | Uses order number variable | 2024-01-15 11:45:00 |
| error_generic | I'm sorry, I didn't understand that. Could you please try again? | Fallback error message | 2024-01-15 12:00:00 |

## 🔌 API Endpoints

### Management API (Authenticated)

All management endpoints require JWT authentication via `Authorization: Bearer <token>` header.

#### Authentication
- `POST /api/auth/login` - Login with username/password
- `GET /api/auth/verify` - Verify JWT token

#### Content Management
- `GET /api/management/responses` - Get all responses (with search/pagination)
- `POST /api/management/responses` - Create new response
- `GET /api/management/responses/:key` - Get specific response
- `PUT /api/management/responses/:key` - Update response
- `DELETE /api/management/responses/:key` - Delete response

### Delivery API (API Key Based)

All delivery endpoints require API key authentication via `X-API-Key: <key>` header.

- `GET /api/delivery/responses/:key` - Get response for bot integration
- `GET /api/delivery/responses` - Get all responses for bot integration

#### Example Bot Integration

```javascript
// Get a specific response
const response = await fetch('https://your-app.com/api/delivery/responses/greeting_welcome', {
  headers: {
    'X-API-Key': 'your-delivery-api-key'  // Generated DELIVERY_API_KEY from .env
  }
});

const data = await response.json();
console.log(data.response_text); // "Hello! How can I help you today?"
```

#### Bot Integration Checklist
- ✅ Generate secure `DELIVERY_API_KEY` using the methods above
- ✅ Store the API key securely in your bot's configuration
- ✅ Include the key in the `X-API-Key` header for all requests
- ✅ Handle HTTP 401 errors for invalid keys
- ✅ Consider implementing automatic retry logic
- ✅ Monitor API usage and implement rate limiting on the bot side

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication for management API
- **API Key Authentication**: Separate authentication for bot integration
- **Rate Limiting**: Protection against abuse (100 requests per 15 minutes per IP)
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configurable CORS settings
- **Helmet Security**: Security headers via Helmet.js
- **Non-root Docker**: Containers run as non-root user

## 🎨 User Interface

### Dashboard Features
- **Responsive Table**: Clean, sortable table with all responses
- **Real-time Search**: Instant filtering by key or content
- **Inline Editing**: Click-to-edit functionality for quick updates
- **Modal Forms**: User-friendly forms for creating new responses
- **Visual Feedback**: Loading states, success/error notifications
- **Delete Confirmation**: Prevents accidental deletions

### Design Principles
- **Clean & Simple**: Minimalist design focused on functionality
- **Intuitive**: Easy-to-use interface for non-technical users
- **Responsive**: Works well on standard desktop screen sizes
- **Accessible**: Proper contrast ratios and keyboard navigation

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended)

```bash
# Production deployment
docker-compose up -d

# With custom environment file
docker-compose --env-file .env.production up -d
```

### Option 2: Manual Deployment

#### Backend
```bash
cd backend
npm install --production
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm run build
# Serve the dist/ directory with your web server
```

### Option 3: Cloud Platforms

The application can be deployed to:
- **AWS**: Using ECS, EKS, or EC2
- **Google Cloud**: Using Cloud Run or GKE
- **Azure**: Using Container Instances or AKS
- **Heroku**: With some modifications for environment variables

## 📝 Development

### Project Structure

```
bot-content-manager/
├── backend/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── middleware/         # Express middleware
│   ├── Dockerfile          # Backend container
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── main.jsx
│   ├── Dockerfile          # Frontend container
│   └── package.json
├── docker-compose.yml      # Docker orchestration
├── .env.example           # Environment template
└── README.md              # This file
```

### Adding New Features

1. **Backend Changes**: Add routes in `backend/routes/`, services in `backend/services/`
2. **Frontend Changes**: Add components in `frontend/src/components/`, pages in `frontend/src/pages/`
3. **Database Changes**: Modify the Google Sheet schema and update the service accordingly

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Backend server port | No | 3001 |
| `NODE_ENV` | Environment mode | No | development |
| `JWT_SECRET` | JWT signing secret (MIN 32 chars) | Yes | - |
| `JWT_EXPIRES_IN` | Token expiration | No | 24h |
| `GOOGLE_SHEET_ID` | Google Sheet ID | Yes | - |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email | Yes | - |
| `GOOGLE_PRIVATE_KEY` | Service account private key | Yes | - |
| `DELIVERY_API_KEY` | API key for bot integration (MIN 64 chars) | Yes | - |
| `ADMIN_USERNAME` | Default admin username | No | admin |
| `ADMIN_PASSWORD` | Default admin password | No | admin123 |

**⚠️ Security Warning**: Both `JWT_SECRET` and `DELIVERY_API_KEY` must be cryptographically strong random strings. Never use the default placeholder values in production!

### Google Sheet Configuration

The Google Sheet must:
1. Have the correct column headers (key, response_text, notes, last_updated)
2. Be shared with the service account email
3. Have Editor permissions for the service account

## 🐛 Troubleshooting

### Common Issues

#### 1. Google Sheets API Errors
- **Error**: "The caller does not have permission"
  - **Solution**: Ensure the service account email has access to the Google Sheet

#### 2. Authentication Issues
- **Error**: "Invalid or expired token"
  - **Solution**: Check JWT_SECRET configuration and token expiration

#### 3. CORS Errors
- **Error**: CORS policy blocking requests
  - **Solution**: Verify FRONTEND_URL environment variable

#### 4. Docker Issues
- **Error**: Container fails to start
  - **Solution**: Check environment variables and Google Sheets configuration

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

### Health Checks

- Backend: `GET http://localhost:3001/health`
- Frontend: `GET http://localhost:3000/health`

## 📈 Monitoring and Logs

### Log Files
- Backend logs: Available in Docker container logs
- Application logs: Written to stdout/stderr

### Monitoring Endpoints
- Health check: `/health`
- API status: Available through health check response

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Create an issue in the repository

## 🔄 Updates and Migrations

### Updating the Application
1. Pull the latest changes
2. Update environment variables if needed
3. Restart the services

### Migrating to Different Bot Platforms
The Google Sheet serves as the single source of truth, making it easy to:
1. Export data from the sheet
2. Import into your new bot platform
3. Update the bot's integration to use the new platform

---

**Built with ❤️ for content managers who want to control their bot's personality without developer assistance.**
