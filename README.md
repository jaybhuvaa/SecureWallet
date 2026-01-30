# 🏦 SecureWallet - Enterprise Digital Banking Platform

A production-grade digital banking application demonstrating enterprise Java development with Spring Boot, React, and modern design patterns.

![SecureWallet Dashboard]((https://securewallet-production.up.railway.app/))

## ✨ Features

- **🔐 JWT Authentication** - Secure login with access & refresh tokens
- **💳 Multi-Wallet Management** - Create Savings, Checking, Investment, and Merchant wallets
- **💸 Transaction Processing** - Deposit, withdraw, and transfer funds
- **📊 Real-time Dashboard** - Track balances, transactions, and analytics
- **🎨 Modern UI** - Beautiful, responsive design with dark mode support
- **🏗️ Design Patterns** - Factory, Strategy, Observer, Builder patterns
- **🔒 SOLID Principles** - Clean, maintainable code architecture

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Java 17 | Core language |
| Spring Boot 3.2 | Framework |
| Spring Security 6 | Authentication & Authorization |
| Spring Data JPA | Data access layer |
| H2 / PostgreSQL | Database |
| JWT (jjwt) | Token-based authentication |
| Lombok | Boilerplate reduction |
| Swagger/OpenAPI | API documentation |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Redux Toolkit | State management |
| React Router v6 | Navigation |
| Framer Motion | Animations |
| Recharts | Charts |

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.8+

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/securewallet.git
   cd securewallet
   ```

2. **Start the backend**
   ```bash
   mvn spring-boot:run
   ```
   Backend will be available at `http://localhost:8080`

3. **Start the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will be available at `http://localhost:3000`

4. **Access the application**
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8080/swagger-ui.html
   - H2 Console: http://localhost:8080/h2-console

### Using Docker

```bash
docker-compose up --build
```

The application will be available at `http://localhost:8080`

## ☁️ Deployment

### Deploy to Railway (Recommended)

1. Create a [Railway](https://railway.app) account
2. Connect your GitHub repository
3. Add a PostgreSQL database
4. Set environment variables:
   - `JWT_SECRET` - A secure base64 encoded secret (512+ bits)
   - `DATABASE_URL` - Provided by Railway
   - `SPRING_PROFILES_ACTIVE` - `prod`
5. Deploy!

### Deploy to Render

1. Create a [Render](https://render.com) account
2. Create a new Web Service
3. Connect your GitHub repository
4. Select "Docker" as the environment
5. Add environment variables
6. Deploy!

### Deploy to Heroku

```bash
# Install Heroku CLI and login
heroku login

# Create app and add PostgreSQL
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set SPRING_PROFILES_ACTIVE=prod

# Deploy
git push heroku main
```

### Deploy to AWS/GCP/Azure

The application is containerized and can be deployed to any container orchestration platform:
- AWS ECS/EKS
- Google Cloud Run/GKE
- Azure Container Apps/AKS

## 📁 Project Structure

```
securewallet/
├── src/main/java/com/securewallet/
│   ├── config/          # Configuration classes
│   ├── controller/      # REST controllers
│   ├── dto/             # Data transfer objects
│   ├── entity/          # JPA entities
│   ├── enums/           # Enumerations
│   ├── exception/       # Exception handling
│   ├── pattern/         # Design pattern implementations
│   ├── repository/      # Data access layer
│   ├── security/        # JWT & authentication
│   └── service/         # Business logic
├── src/main/resources/
│   └── application.yml  # Application configuration
├── frontend/
│   ├── src/
│   │   ├── api/         # API client & services
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Page components
│   │   ├── store/       # Redux store
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── Dockerfile
├── docker-compose.yml
└── pom.xml
```

## 🔑 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/logout` | User logout |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get current user |

### Wallets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/wallets` | Get all wallets |
| GET | `/api/v1/wallets/{id}` | Get wallet by ID |
| POST | `/api/v1/wallets` | Create wallet |
| GET | `/api/v1/wallets/{id}/balance` | Get wallet balance |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/transactions` | Get transactions |
| GET | `/api/v1/transactions/{id}` | Get transaction |
| POST | `/api/v1/transactions/deposit` | Deposit funds |
| POST | `/api/v1/transactions/withdraw` | Withdraw funds |
| POST | `/api/v1/transactions/transfer` | Transfer funds |

## 🏗️ Design Patterns Implemented

1. **Factory Pattern** - Wallet creation with different configurations
2. **Strategy Pattern** - Flexible payment processing (extensible)
3. **Observer Pattern** - Event-driven notifications (via Spring Events)
4. **Builder Pattern** - Complex object construction (entities)
5. **Singleton Pattern** - Configuration management (Spring beans)

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password encryption with BCrypt (strength 12)
- CORS configuration for frontend integration
- Role-based access control (USER, ADMIN, MERCHANT)
- Pessimistic locking for concurrent transactions
- Input validation and sanitization

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 8080 |
| `DATABASE_URL` | Database connection URL | H2 in-memory |
| `DB_USERNAME` | Database username | sa |
| `DB_PASSWORD` | Database password | (empty) |
| `JWT_SECRET` | JWT signing secret (base64) | Dev secret |
| `JWT_ACCESS_EXPIRATION` | Access token expiry (ms) | 3600000 (1h) |
| `JWT_REFRESH_EXPIRATION` | Refresh token expiry (ms) | 604800000 (7d) |

## 🧪 Testing

```bash
# Run backend tests
mvn test

# Run frontend tests
cd frontend && npm test
```

## 📄 License

MIT License - feel free to use this project for learning or as a starting point for your own banking application.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Spring Boot and React
