# WalletWise

WalletWise is a simple budgeting and expense tracking SaaS application that helps users manage their income and expenses across multiple wallets with subscription-based features.

## 🔍 Overview
WalletWise allows users to record daily, weekly, and monthly financial transactions.  
The app uses a subscription model where advanced features are unlocked for Pro users.

This project is built as a production-style React application to demonstrate frontend architecture, state management, and real-world business logic.

## 🚀 Tech Stack
- React
- TypeScript
- React Router
- React Query
- Zustand (or Redux Toolkit)
- Axios
- Vite

## ✨ Features

### Core Features
- User authentication
- Income & expense tracking
- Wallet-based budgeting
- Transaction history (daily / weekly / monthly)
- Responsive dashboard UI

### Subscription Features
| Feature | Free | Pro |
|------|------|-----|
| Wallet limit | Up to 3 | Unlimited |
| Transaction tracking | ✅ | ✅ |
| Financial summary | Basic | Advanced |
| Data export | ❌ | ✅ |

## 🔐 Subscription Rules
- Free users can create up to 3 wallets
- Pro users can create unlimited wallets
- Subscription logic is mocked for demo purposes

## 📂 Project Structure
src/
├─ components/
├─ pages/
├─ hooks/
├─ services/
├─ stores/
├─ routes/
├─ types/
└─ utils/

## ⚙️ Setup & Installation
```bash
npm install
npm run dev
