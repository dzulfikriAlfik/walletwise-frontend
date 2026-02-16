# WalletWise Frontend

WalletWise is a budgeting and expense tracking SaaS application that helps users manage their income and expenses across multiple wallets with subscription-based features.

## System Design Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     WalletWise Frontend (React SPA)              │
├──────────────────────────────────────────────────────────────────┤
│  Pages (Routes)                                                  │
│  ├── Auth (Login, Register)                                      │
│  ├── Dashboard                                                   │
│  └── Index (Landing)                                             │
├──────────────────────────────────────────────────────────────────┤
│  State Management                                                │
│  ├── React Query (server state, API cache)                       │
│  └── Zustand (client state)                                      │
├──────────────────────────────────────────────────────────────────┤
│  Services (Axios) ──────────────────────► WalletWise Backend API │
└──────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Routing | React Router v7 |
| State (Server) | TanStack React Query |
| State (Client) | Zustand |
| HTTP Client | Axios |
| Styling | Tailwind CSS |

## Feature List

### Core Features
- User authentication (login, register)
- Income & expense tracking
- Wallet-based budgeting
- Transaction history (daily / weekly / monthly)
- Responsive dashboard UI

### Subscription Features
| Feature | Free | Pro |
|---------|------|-----|
| Wallet limit | Up to 3 | Unlimited |
| Transaction tracking | ✅ | ✅ |
| Financial summary | Basic | Advanced |
| Data export | ❌ | ✅ |

## API Documentation

The frontend consumes the WalletWise Backend API. For full API documentation, see the [walletwise-backend](https://github.com/dzulfikriAlfik/walletwise-backend) repository.

**Base URL:** `http://localhost:3000/api` (development)

Key endpoints used:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `GET /api/wallets` - List wallets
- `POST /api/wallets` - Create wallet
- `PATCH /api/wallets/:id` - Update wallet
- `DELETE /api/wallets/:id` - Delete wallet

## How to Run Locally

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

App runs at `http://localhost:5173`

### Build for production

Build uses `--mode production` and loads `.env.production`:

```bash
# Production build (reads .env.production)
npm run build

# Development mode build (reads .env)
npm run build:dev
```

### Preview production build
```bash
npm run preview
```

### Environment

| File | Used when |
|------|-----------|
| `.env` | `npm run dev`, `npm run build:dev` |
| `.env.production` | `npm run build` |

Copy `.env.example` to `.env` for development. For production build, copy `.env.production.example` to `.env.production`:

```
VITE_API_BASE_URL=http://localhost:3000/api   # Backend API base URL
VITE_API_TIMEOUT=30000                         # Request timeout (ms, optional)
```

## Deployment Link

<!-- Add your deployed frontend URL here, e.g. https://walletwise.vercel.app -->
- **Production:** _Add deployment link when ready_
- **Staging:** _Add staging link when ready_

---

For detailed architecture, see [docs/architecture/architecture.md](docs/architecture/architecture.md)
