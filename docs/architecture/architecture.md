# WalletWise Architecture Documentation

## 📐 Project Structure

This document outlines the architecture and folder structure of WalletWise frontend application, following IPA Design Quality Level 2 standards.

### Directory Structure

```
src/
├── components/
│   ├── ui/              # Atomic UI components (Tailwind CSS)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   └── ...
│   ├── layout/          # Layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── MainLayout.tsx
│   └── features/        # Feature-specific components
│       ├── auth/
│       ├── wallet/
│       ├── transaction/
│       └── billing/
├── pages/               # Route pages (view layer)
│   ├── Auth/
│   ├── Dashboard/
│   ├── Billing/
│   └── Clients/
├── services/            # API calls & external services
│   ├── api/
│   ├── auth.service.ts
│   ├── wallet.service.ts
│   └── transaction.service.ts
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   ├── useWallet.ts
│   └── useTransaction.ts
├── stores/              # State management (Zustand)
│   ├── auth.store.ts
│   ├── wallet.store.ts
│   └── transaction.store.ts
├── types/               # TypeScript type definitions
│   ├── user.ts
│   ├── wallet.ts
│   ├── transaction.ts
│   └── subscription.ts
├── utils/               # Utility functions
│   ├── format.ts
│   ├── validation.ts
│   └── constants.ts
├── lib/                 # Third-party library configurations
│   └── utils.ts
└── styles/              # Global styles
```

## 🎯 Design Principles (IPA Level 2)

### 1. Module Structure and Responsibility

#### Separation of Concerns
- **Pages**: Route handlers and view composition only
- **Components**: UI rendering and user interaction
- **Services**: API communication and external integrations
- **Stores**: Application state management
- **Hooks**: Reusable business logic
- **Utils**: Pure functions without side effects

#### Single Responsibility
Each module has one clear purpose:
- `auth.service.ts` → Authentication API calls
- `auth.store.ts` → Authentication state management
- `useAuth.ts` → Authentication business logic hook
- `LoginPage.tsx` → Login view composition

### 2. Naming Conventions

#### Files and Folders
- **PascalCase**: Components and Pages (`DashboardLayout.tsx`)
- **camelCase**: Services, stores, hooks, utils (`auth.service.ts`)
- **kebab-case**: UI components (`button.tsx`, `card.tsx`)
- **lowercase**: Folders (`components/`, `services/`)

#### Code Naming
```typescript
// Types - PascalCase with suffix
type UserProfile = {...}
interface WalletData {...}
enum SubscriptionTier {...}

// Components - PascalCase
export const DashboardLayout = () => {...}
export const WalletCard = () => {...}

// Hooks - camelCase with 'use' prefix
export const useAuth = () => {...}
export const useWalletBalance = () => {...}

// Services - camelCase with descriptive name
export const authService = {...}
export const walletService = {...}

// Utilities - camelCase
export const formatCurrency = () => {...}
export const validateEmail = () => {...}
```

### 3. Dependency Direction

```
┌─────────────────────────────────────┐
│           Pages (View)              │
│    ┌─────────────────────┐          │
│    │    Components       │          │
│    └─────────────────────┘          │
└─────────────────────────────────────┘
              ↓ uses
┌─────────────────────────────────────┐
│        Business Logic               │
│  ┌────────┐  ┌────────┐  ┌──────┐  │
│  │ Hooks  │  │ Stores │  │Utils │  │
│  └────────┘  └────────┘  └──────┘  │
└─────────────────────────────────────┘
              ↓ uses
┌─────────────────────────────────────┐
│      External Integration           │
│         ┌────────┐                  │
│         │Services│                  │
│         └────────┘                  │
└─────────────────────────────────────┘
              ↓ uses
┌─────────────────────────────────────┐
│        Types & Config               │
└─────────────────────────────────────┘
```

**Rules:**
- High-level modules (Pages) depend on mid-level (Hooks, Stores)
- Mid-level modules depend on low-level (Services, Utils)
- Low-level modules depend only on Types
- No circular dependencies allowed
- Utils must be pure functions without external dependencies

### 4. Component Architecture

#### UI Components (`components/ui/`)
- Atomic, reusable components with Tailwind CSS
- No business logic
- Accept props for customization
- Focus on presentation only

```typescript
// Example: button.tsx
export const Button = ({ children, ...props }) => {
  return <button {...props}>{children}</button>
}
```

#### Layout Components (`components/layout/`)
- Structure and layout composition
- Can use UI components
- No business logic, only layout logic

```typescript
// Example: DashboardLayout.tsx
export const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard">
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}
```

#### Feature Components (`components/features/`)
- Feature-specific, connected components
- Can use hooks and stores
- Contains business logic specific to the feature

```typescript
// Example: WalletCard.tsx
export const WalletCard = () => {
  const { wallet } = useWallet()
  const formatBalance = useFormatCurrency()
  
  return <Card>...</Card>
}
```

### 5. State Management Strategy

#### Local State (useState)
- Component-specific UI state
- Form inputs, toggles, temporary data

#### Global State (Zustand)
- Authentication state
- User profile
- Wallet data
- Subscription info

#### Server State (React Query)
- API data fetching
- Cache management
- Background updates
- Optimistic updates

### 6. API Integration Pattern

```typescript
// 1. Define type
export interface Wallet {
  id: string
  name: string
  balance: number
}

// 2. Create service
export const walletService = {
  getAll: () => api.get<Wallet[]>('/wallets'),
  create: (data) => api.post('/wallets', data)
}

// 3. Create hook
export const useWallets = () => {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: walletService.getAll
  })
}

// 4. Use in component
const WalletList = () => {
  const { data: wallets } = useWallets()
  return <div>...</div>
}
```

## 🔐 Feature Implementation Guidelines

### Authentication Flow
1. User submits credentials → `LoginPage`
2. Page calls → `useAuth` hook
3. Hook calls → `authService.login()`
4. Service returns data → Hook updates `authStore`
5. Store notifies → Components re-render

### Wallet Management
- Free users: Limited to 3 wallets (validation in `useWallet` hook)
- Pro users: Unlimited wallets
- Subscription check happens in business logic, not UI

### Transaction Tracking
- Daily/Weekly/Monthly views use same component
- Date filtering in service layer
- Formatting in utility layer

## 📝 Code Quality Standards

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Proper interface definitions
- Generic types where applicable

### Components
- Functional components only
- Named exports preferred
- Props destructuring
- TypeScript props interface

### Testing (Future)
- Unit tests for utilities
- Integration tests for hooks
- Component tests for features
- E2E tests for critical flows

## 🔄 Update Policy

This document should be updated when:
- New architectural patterns are introduced
- Folder structure changes
- New conventions are adopted
- Major refactoring occurs

**Last Updated:** February 5, 2026
